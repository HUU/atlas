import { context } from '@opentelemetry/api';
import { getRouterManifest } from '@tanstack/start/router-manifest';
import {
  createStartHandler,
  defaultStreamHandler,
} from '@tanstack/start/server';
import { defineEventHandler } from 'vinxi/http';
import { createRouter } from './router';

export default defineEventHandler(async (event) => {
  return context.with(
    event.otel.ctx,
    createStartHandler({
      createRouter,
      getRouterManifest,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- TanStack Start uses an Any here for some reason
    })(defaultStreamHandler),
    undefined,
    event,
  );
});
