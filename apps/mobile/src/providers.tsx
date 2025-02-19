import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { api } from './clients';

const queryClient = new QueryClient();

export function Providers({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <api.ReactQueryProvider>{children}</api.ReactQueryProvider>
    </QueryClientProvider>
  );
}
