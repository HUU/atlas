import type { contract } from '@atlas/api';
import type { AppRouteImplementation } from './types';

const login: AppRouteImplementation<typeof contract.auth.login> = async (
  _request,
) => {
  return { status: 200, body: { name: 'hello' } };
};

export const router = {
  login,
};
