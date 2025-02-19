import { contract } from '@atlas/api';
import { initTsrReactQuery } from '@ts-rest/react-query/v5';
import { config } from './config';

export const api = initTsrReactQuery(contract, {
  baseUrl: config.publicApiUrl,
});
