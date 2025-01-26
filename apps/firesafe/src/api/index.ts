import { initContract } from '@ts-rest/core';
import { z } from 'zod';

const c = initContract();
export const contract = c.router({
  upsert: {
    method: 'POST',
    path: '/upsert',
    body: z.object({}),
    responses: {
      200: z.object({
        name: z.string(),
      }),
    },
    summary: 'Insert a new secret or replace the value of an existing secret.',
  },
  statusz: {
    method: 'GET',
    path: '/statusz',
    responses: {
      200: z.object({
        message: z.string(),
      }),
    },
    summary: 'Confirm the server is happy and healthy.',
  },
});
