import { contract } from '@atlas/api';
import { fetchRequestHandler } from '@ts-rest/serverless/fetch';
import { defineEventHandler, toWebRequest } from 'vinxi/http';
import { apiRouter } from '.';

// eslint-disable-next-line import/no-default-export -- nitro handlers must be default exported
export default defineEventHandler(async (event) => {
  const request = toWebRequest(event);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- TS-REST types this return as an any, nothing we can do
  return await fetchRequestHandler({
    request,
    contract,
    router: apiRouter,
    options: {
      basePath: '/api',
    },
  });
});
