import { config } from '@/config';
import { contract } from '@atlas/api';
import { useQueryClient } from '@tanstack/react-query';
import { tsRestFetchApi } from '@ts-rest/core';
import { initTsrReactQuery } from '@ts-rest/react-query/v5';
import { createContext, useContext, useReducer } from 'react';

// this is objectively kind of nuts and "not reactive" but the `api` client
// doesn't expose a way to adjust the baseUrl and at init time creates a bunch
// of functions which capture/bind the baseUrl. Moreover, this gets directly
// imported everywhere so even if we tried to do some kind of clever dynamic
// provider you're still screwed. The only real alternative would be to require
// developers to access the API client instead via a provider which is super
// awkward and would flummox AI.

let SWITCH_TO_STAGING = false;

export const api = initTsrReactQuery(contract, {
  baseUrl: config.publicApiUrl,
  api: async (args) => {
    if (SWITCH_TO_STAGING) {
      args.path = args.path.replace(config.publicApiUrl, config.stagingApiUrl);
    }
    return await tsRestFetchApi(args);
  },
});

interface IStagingContext {
  isStaging: boolean;
  toggleStaging: () => void;
}

const stagingContext = createContext<IStagingContext>({
  isStaging: SWITCH_TO_STAGING,
  toggleStaging: () => null,
});

export function StagingProvider({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);
  const queryClient = useQueryClient();

  const toggleStaging = (): void => {
    queryClient.clear();
    SWITCH_TO_STAGING = !SWITCH_TO_STAGING;
    forceUpdate();
  };

  return (
    <stagingContext.Provider
      value={{ isStaging: SWITCH_TO_STAGING, toggleStaging }}
    >
      {children}
    </stagingContext.Provider>
  );
}

export function useStagingStatus(): IStagingContext {
  const context = useContext(stagingContext);
  return context;
}
