import {
  type Attributes,
  type Context,
  context,
  metrics,
  propagation,
  ROOT_CONTEXT,
  type Span,
  SpanKind,
  trace,
} from '@opentelemetry/api';
import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks';
import { Resource } from '@opentelemetry/resources';
import {
  ConsoleMetricExporter,
  MeterProvider,
  PeriodicExportingMetricReader,
} from '@opentelemetry/sdk-metrics';
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
  METRIC_HTTP_SERVER_REQUEST_DURATION,
} from '@opentelemetry/semantic-conventions';
import { differenceInMilliseconds } from 'date-fns';
import {
  getHeaders,
  getRequestProtocol,
  getRequestURL,
  getResponseStatus,
  type H3Event,
} from 'h3';
import { defineNitroPlugin } from 'nitropack/dist/runtime/plugin';
import * as _ from 'radashi';
import { version } from '../../package.json';

declare module 'h3' {
  // eslint-disable-next-line @typescript-eslint/naming-convention -- augment existing interface
  interface H3Event {
    otel: {
      span: Span;
      endTime?: Date;
      ctx: Context;
      startTime: Date;
    };
  }
}

// eslint-disable-next-line import/no-default-export -- Nitro plugins use defaults I think
export default defineNitroPlugin((nitro) => {
  const contextManager = new AsyncLocalStorageContextManager();
  const provider = new NodeTracerProvider({
    resource: new Resource({
      [ATTR_SERVICE_NAME]: 'atlas',
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

  const meterProvider = new MeterProvider({
    readers: [
      new PeriodicExportingMetricReader({
        exporter: new ConsoleMetricExporter(),
        exportIntervalMillis: 10000,
      }),
    ],
  });
  metrics.setGlobalMeterProvider(meterProvider);

  const meter = metrics.getMeter('atlas.nitro', version);

  const requestCounter = meter.createCounter('http.server.request.count', {
    description: 'Counts all incoming requests',
    unit: '{request}',
  });

  const responseTimeHistogram = meter.createHistogram(
    METRIC_HTTP_SERVER_REQUEST_DURATION,
    {
      description: 'Tracks the response time of requests',
      unit: 'ms',
    },
  );

  nitro.hooks.hook('request', async (event) => {
    const tracer = trace.getTracer('nitro-opentelemetry');
    const currentContext = context.active();

    // Extract the parent context from the headers if it exists
    // If a span is already set in the context, use it as the parent
    const parentCtx = trace.getSpan(currentContext)
      ? currentContext
      : propagation.extract(currentContext, getHeaders(event));

    const span = tracer.startSpan(
      event.path,
      {
        attributes: await createOtelSemanticConventionRequestAttributes(event),
        kind: SpanKind.SERVER,
      },
      parentCtx,
    );
    const ctx = trace.setSpan(context.active(), span);
    event.otel = {
      span,
      endTime: undefined,
      ctx,
      startTime: new Date(),
    };
  });

  nitro.hooks.hook('beforeResponse', (event) => {
    event.otel.endTime = new Date();
  });

  nitro.hooks.hook('afterResponse', async (event) => {
    const otelAttributes = {
      ...(await createOtelSemanticConventionRequestAttributes(event)),
      ...(await createOtelSemanticConventionResponseAttributes(event)),
    };

    requestCounter.add(1, removeHighCardinalityAttributes(otelAttributes));

    if (event.otel.endTime) {
      // this should pretty much always be truthy, it's populated in the `beforeResponse` hook
      responseTimeHistogram.record(
        differenceInMilliseconds(event.otel.endTime, event.otel.startTime),
        removeHighCardinalityAttributes(otelAttributes),
      );
    }

    event.otel.span.setAttribute(
      ATTR_HTTP_RESPONSE_STATUS_CODE,
      otelAttributes[ATTR_HTTP_RESPONSE_STATUS_CODE],
    );
    event.otel.span.end(event.otel.endTime);
  });

  nitro.hooks.hook('error', async (error, { event }) => {
    if (event) {
      const otelAttributes =
        await createOtelSemanticConventionResponseAttributes(event);
      event.otel.span.recordException(error);
      event.otel.span.setAttribute(
        ATTR_HTTP_RESPONSE_STATUS_CODE,
        otelAttributes[ATTR_HTTP_RESPONSE_STATUS_CODE],
      );
      event.otel.span.end();
    } else {
      const span = trace.getSpan(ROOT_CONTEXT);
      span?.recordException(error);
      span?.end();
    }
  });

  nitro.hooks.hook('close', async () => {
    // flush all cached spans and gracefully shut down
    await batchingSpanProcessor.shutdown();
  });

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type -- infer for strong typing on available keys
  async function createOtelSemanticConventionRequestAttributes(event: H3Event) {
    const requestURL = getRequestURL(event);
    const urlPath =
      (await nitro.h3App.resolve(event.path))?.route ?? event.path;

    return {
      [ATTR_URL_PATH]: urlPath,
      [ATTR_URL_FULL]: requestURL.toString(),
      [ATTR_HTTP_REQUEST_METHOD]: event.method,
      [ATTR_HTTP_RESPONSE_STATUS_CODE]: getResponseStatus(event),
      [ATTR_URL_SCHEME]: getRequestProtocol(event),
      [ATTR_SERVER_ADDRESS]: requestURL.host,
      [ATTR_SERVER_PORT]: requestURL.port,
    };
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type -- infer for strong typing on available keys
  async function createOtelSemanticConventionResponseAttributes(
    event: H3Event,
  ) {
    return {
      [ATTR_HTTP_RESPONSE_STATUS_CODE]: getResponseStatus(event),
    };
  }

  function removeHighCardinalityAttributes(attr: Attributes): Attributes {
    return _.omit(attr, [ATTR_URL_FULL]);
  }
});
