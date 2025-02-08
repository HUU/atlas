import contract from '@atlas/api';
import { tsr } from '@ts-rest/serverless/fetch';

export default tsr.route(contract.healthz, async (_request) => {
  return { status: 200, body: { message: 'All systems operational.' } };
});
