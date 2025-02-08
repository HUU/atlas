import contract from '@atlas/api';
import { tsr } from '@ts-rest/serverless/fetch';

const login = tsr.route(contract.auth.login, async (_request) => {
  return { status: 200, body: { name: 'hello' } };
});

export default tsr.router(contract.auth, {
  login,
});
