import { GlobalSingleton } from '@atlas/common';
import type { ApiFetcherArgs } from '@ts-rest/core';

export const apiMockers = new GlobalSingleton(
  'apiMockers',
  (): IApiMocker[] => [],
);

interface IApiMocker {
  requestMatches: (args: ApiFetcherArgs) => boolean;
  response: () => Partial<{
    status: number;
    body: unknown;
    headers: Headers;
  }>;
}

beforeEach(() => {
  apiMockers.value.length = 0;
});

export const mockApiCall = (mocker: IApiMocker): void => {
  apiMockers.value.push(mocker);
};
