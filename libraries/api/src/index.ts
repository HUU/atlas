import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import { authContract } from './auth';

const c = initContract();

export default c.router({
  auth: authContract,
  healthz: {
    method: 'GET',
    path: '/healthz',
    responses: {
      200: z.object({
        message: z.string(),
      }),
    },
    summary: 'Check that the server is up and happy.',
  },
});
