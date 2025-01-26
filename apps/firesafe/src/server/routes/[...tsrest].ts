import { fetchRequestHandler } from '@ts-rest/serverless/fetch';
import { contract } from '../../api';
import { router } from '../ts-rest';

export default defineEventHandler(async (event) => {
  const request = toWebRequest(event);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- TS-REST types this return as an any, nothing we can do
  return await fetchRequestHandler({
    request,
    contract,
    router,
    options: {
      basePath: '/',
    },
  });
});
