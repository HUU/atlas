import contract from '@atlas/api';
import { initClient } from '@ts-rest/core';

export const apiClient = initClient(contract, {
  baseUrl: process.env.EXPO_PUBLIC_API_URL!,
});
