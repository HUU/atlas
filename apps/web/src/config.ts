import { CONFIG_PROVIDER } from '@atlas/common';
import { databaseConfigSchemaFragment } from '@atlas/database';
import { z } from 'zod';

const appConfigSchemaFragment = CONFIG_PROVIDER.partialSchema({
  nodeEnv: z
    .enum(['development', 'staging', 'production'])
    .default('development'),
});

export const CLIENT_SAFE_CONFIG = CONFIG_PROVIDER.readerFor(
  appConfigSchemaFragment,
);
export const APP_CONFIG = CONFIG_PROVIDER.finalizeSchema((schemaBuilder) => {
  return schemaBuilder
    .merge(databaseConfigSchemaFragment)
    .merge(appConfigSchemaFragment);
});
