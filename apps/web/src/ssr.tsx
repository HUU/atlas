import { getRouterManifest } from '@tanstack/start/router-manifest';
import {
  createStartHandler,
  defaultStreamHandler,
} from '@tanstack/start/server';
import { createRouter } from './router';

export default createStartHandler({
  createRouter,
  getRouterManifest,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- TanStack Start uses an Any here for some reason
})(defaultStreamHandler);
