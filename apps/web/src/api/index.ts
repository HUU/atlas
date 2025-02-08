import contract from '@atlas/api';
import { tsr } from '@ts-rest/serverless/fetch';
import auth from './auth';
import healthz from './healthz';

export default tsr.router(contract, {
  auth,
  healthz,
});
