import { initContract } from '@ts-rest/core';
import { z } from 'zod';

const c = initContract();
export const authContract = c.router({
  login: {
    method: 'POST',
    path: '/login',
    body: z.object({}),
    responses: {
      200: z.object({
        name: z.string(),
      }),
    },
    summary: 'Login',
  },
});
