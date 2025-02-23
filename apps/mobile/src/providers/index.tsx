import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { SessionProvider } from './auth';
import { api, StagingProvider } from './clients';

const queryClient = new QueryClient();

export function Providers({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <ActionSheetProvider>
      <SessionProvider>
        <QueryClientProvider client={queryClient}>
          <StagingProvider>
            <api.ReactQueryProvider>{children}</api.ReactQueryProvider>
          </StagingProvider>
        </QueryClientProvider>
      </SessionProvider>
    </ActionSheetProvider>
  );
}
