import { contract } from '@atlas/api';
import { initClient } from '@ts-rest/core';
import { config } from './config';

export const apiClient = initClient(contract, {
  baseUrl: config.publicApiUrl,
});
