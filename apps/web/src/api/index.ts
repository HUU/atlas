import { contract } from '@atlas/api';
import { tsr } from '@ts-rest/serverless/fetch';
import { authRouter } from './auth';
import { healthzRouter } from './healthz';

export const apiRouter = tsr.router(contract, {
  auth: authRouter,
  healthz: healthzRouter,
});
