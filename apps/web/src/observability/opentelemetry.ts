import * as api from '@opentelemetry/api';
import { type Context, context, type Span, trace } from '@opentelemetry/api';
import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks';
import { Resource } from '@opentelemetry/resources';
import {
  BatchSpanProcessor,
  ConsoleSpanExporter,
  NodeTracerProvider,
} from '@opentelemetry/sdk-trace-node';
import {
  ATTR_HTTP_REQUEST_METHOD,
  ATTR_HTTP_RESPONSE_STATUS_CODE,
  ATTR_SERVER_ADDRESS,
  ATTR_SERVER_PORT,
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
  ATTR_URL_FULL,
  ATTR_URL_PATH,
  ATTR_URL_SCHEME,
} from '@opentelemetry/semantic-conventions';
import {
  getHeaders,
  getRequestProtocol,
  getRequestURL,
  getResponseStatus,
} from 'h3';
import { defineNitroPlugin } from 'nitropack/dist/runtime/plugin';
import { version } from '../../package.json';

declare module 'h3' {
  // eslint-disable-next-line @typescript-eslint/naming-convention -- augment existing interface
  interface H3Event {
    otel: {
      span: Span;
      endTime: number | undefined;
      ctx: Context;
    };
  }
}

// eslint-disable-next-line import/no-default-export -- Nitro plugins use defaults I think
export default defineNitroPlugin((nitro) => {
  const contextManager = new AsyncLocalStorageContextManager();
  const provider = new NodeTracerProvider({
    resource: new Resource({
      [ATTR_SERVICE_NAME]: 'atlas-web',
      [ATTR_SERVICE_VERSION]: version,
    }),
  });
  const batchingSpanProcessor = new BatchSpanProcessor(
    new ConsoleSpanExporter(),
  );
  provider.addSpanProcessor(batchingSpanProcessor);
  provider.register({
    contextManager,
  });

  nitro.hooks.hook('request', async (event) => {
    const tracer = trace.getTracer('nitro-opentelemetry');
    const requestURL = getRequestURL(event);
    const currentContext = context.active();

    // Extract the parent context from the headers if it exists
    // If a span is already set in the context, use it as the parent
    const parentCtx = trace.getSpan(currentContext)
      ? currentContext
      : api.propagation.extract(currentContext, getHeaders(event));
    const urlPath =
      (await nitro.h3App.resolve(event.path))?.route ?? event.path;
    const span = tracer.startSpan(
      event.path,
      {
        attributes: {
          [ATTR_URL_PATH]: urlPath,
          [ATTR_URL_FULL]: requestURL.toString(),
          [ATTR_HTTP_REQUEST_METHOD]: event.method,
          [ATTR_URL_SCHEME]: getRequestProtocol(event),
          [ATTR_SERVER_ADDRESS]: requestURL.host,
          [ATTR_SERVER_PORT]: requestURL.port,
        },
        kind: api.SpanKind.SERVER,
      },
      parentCtx,
    );
    const ctx = trace.setSpan(context.active(), span);
    event.otel = {
      span,
      endTime: undefined,
      ctx,
    };
  });

  nitro.hooks.hook('beforeResponse', (event) => {
    event.otel.endTime = Date.now();
  });

  nitro.hooks.hook('afterResponse', async (event) => {
    event.otel.span.setAttribute(
      ATTR_HTTP_RESPONSE_STATUS_CODE,
      getResponseStatus(event),
    );
    event.otel.span.end(event.otel.endTime);
  });

  nitro.hooks.hook('error', async (error, { event }) => {
    if (event) {
      event.otel.span.recordException(error);
      event.otel.span.setAttribute(
        ATTR_HTTP_RESPONSE_STATUS_CODE,
        getResponseStatus(event),
      );
      event.otel.span.end();
    } else {
      const span = trace.getSpan(api.ROOT_CONTEXT);
      span?.recordException(error);
      span?.end();
    }
  });

  nitro.hooks.hook('close', async () => {
    // flush all cached spans and gracefully shut down
    await batchingSpanProcessor.shutdown();
  });
});
