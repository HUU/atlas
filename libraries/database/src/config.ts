import { CONFIG_PROVIDER } from '@atlas/common';
import { z } from 'zod';

export const configSchema = CONFIG_PROVIDER.partialSchema({
  postgresHost: z.string().default('localhost'),
  postgresPort: z.coerce.number(),
  postgresUser: z.string(),
  postgresPassword: z.string(),
  postgresDb: z.string(),
});

export const DATABASE_CONFIG = CONFIG_PROVIDER.readerFor(configSchema);
