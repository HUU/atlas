import { tsr } from '@ts-rest/serverless/fetch';
import { contract } from '../../api';

export default tsr.route(contract.statusz, async (_request) => {
  return { status: 200, body: { message: 'Everything nominal.' } };
});
