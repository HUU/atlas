import { context } from '@opentelemetry/api';
import { getRouterManifest } from '@tanstack/react-start/router-manifest';
import {
  createStartHandler,
  defaultStreamHandler,
} from '@tanstack/react-start/server';
import { defineEventHandler } from 'vinxi/http';
import { createRouter } from './router';

export default defineEventHandler(async (event) => {
  return context.with(
    event.otel.ctx,
    createStartHandler({
      createRouter,
      getRouterManifest,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- TSS uses an Any here for reasons
    })(defaultStreamHandler),
    undefined,
    event,
  );
});
