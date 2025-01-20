import type {
  AppRoute,
  ServerInferRequest,
  ServerInferResponses,
} from '@ts-rest/core';
import type { TsRestRequest } from '@ts-rest/serverless/fetch';

// this is a copy from ts-rest/serverless but this type isn't exported so we're forced to have our own copy
export type AppRouteImplementation<
  T extends AppRoute,
  TPlatformArgs = never,
  TRequestExtension = never,
> = (
  args: ServerInferRequest<T>,
  context: TPlatformArgs & {
    appRoute: T;
    request: TsRestRequest & TRequestExtension;
    responseHeaders: Headers;
  },
) => Promise<ServerInferResponses<T>>;
