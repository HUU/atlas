import { contract } from '@atlas/api';
import { initTsrReactQuery } from '@ts-rest/react-query/v5';
import { tsr } from '@ts-rest/serverless/fetch';
import { authRouter } from './auth';
import { healthzRouter } from './healthz';

export const apiRouter = tsr.router(contract, {
  auth: authRouter,
  healthz: healthzRouter,
});

export const apiClient = initTsrReactQuery(contract, {
  baseUrl: 'http://localhost:3000/api',
});
