import { contract } from '@atlas/api';
import { fetchRequestHandler, tsr } from '@ts-rest/serverless/fetch';
import { defineEventHandler, toWebRequest } from 'vinxi/http';

export default defineEventHandler(async (event) => {
  const request = toWebRequest(event);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- TS-REST types this return as an any, nothing we can do
  return await fetchRequestHandler({
    request,
    contract,
    router: tsr.router(contract, {
      auth: {
        login: async (_request) => {
          return { status: 200, body: { name: 'hello' } };
        },
      },
    }),
    options: {
      basePath: '/api',
    },
  });
});
