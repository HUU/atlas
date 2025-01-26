import { tsr } from '@ts-rest/serverless/fetch';
import { contract } from '../../api';
import statusz from './statusz';
import upsert from './upsert';

export const router = tsr.router(contract, {
  upsert,
  statusz,
});
