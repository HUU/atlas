import { CONFIG_PROVIDER } from '@atlas/common';
import { databaseConfigSchema } from '@atlas/database';

export const APP_CONFIG = CONFIG_PROVIDER.finalizeSchema((schemaBuilder) => {
  return schemaBuilder.merge(databaseConfigSchema);
});
