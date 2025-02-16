import { createRouter as createTanStackRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type -- automatically infers typing of the route tree
export function createRouter() {
  const router = createTanStackRouter({
    routeTree,
    scrollRestoration: true,
  });

  return router;
}

declare module '@tanstack/react-router' {
  // eslint-disable-next-line @typescript-eslint/naming-convention -- must match existing interface name inside TanStack Router
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
