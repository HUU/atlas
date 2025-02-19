import { QueryClient } from '@tanstack/react-query';
import { createRouter as createTanStackRouter } from '@tanstack/react-router';
import { routerWithQueryClient } from '@tanstack/react-router-with-query';
import { routeTree } from './routeTree.gen';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type -- automatically infers typing of the route tree
export function createRouter() {
  const queryClient = new QueryClient();

  return routerWithQueryClient(
    createTanStackRouter({
      routeTree,
      scrollRestoration: true,
      context: { queryClient },
    }),
    queryClient,
  );
}

declare module '@tanstack/react-router' {
  // eslint-disable-next-line @typescript-eslint/naming-convention -- must match existing interface name inside TanStack Router
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
