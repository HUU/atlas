import { SessionProvider } from '@/providers/auth';
import { api, StagingProvider } from '@/providers/clients';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderOptions } from '@testing-library/react-native';
import React from 'react';

// by default gcTime is Infinity so when Jest goes to unmount components
// using React Query it triggers a destroy event which then schedules
// a GC for NEVER. This causes Jest to hang open. God damn.
const zeroGcTimeQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 0,
    },
    mutations: {
      gcTime: 0,
    },
  },
});

const TestProviders = ({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element => {
  return (
    <SessionProvider>
      <QueryClientProvider client={zeroGcTimeQueryClient}>
        <StagingProvider>
          <api.ReactQueryProvider>{children}</api.ReactQueryProvider>
        </StagingProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
};

const customRender = (
  ui: React.ReactElement,
  options?: RenderOptions,
): ReturnType<typeof render> =>
  render(ui, { wrapper: TestProviders, ...options });

export * from '@testing-library/react-native';
export { customRender as render };
