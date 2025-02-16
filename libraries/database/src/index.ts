import { GlobalJustInTimeSingleton } from '@atlas/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { DATABASE_CONFIG } from './config';

const dbSingleton = new GlobalJustInTimeSingleton('DATABASE', () =>
  drizzle(
    `postgres://${DATABASE_CONFIG.postgresUser}:${DATABASE_CONFIG.postgresPassword}@${DATABASE_CONFIG.postgresHost}:${DATABASE_CONFIG.postgresPort}/${DATABASE_CONFIG.postgresDb}`,
  ),
);

/* db is exposed as a proxy into dbSingleton so that you can import {db} without
   causing the drizzle constructor to evaluate. It will only be evaluated the 1st
   time you actually access it which ensures you have full control over when the db
   is initialize i.e. after the config has been loaded so you can get the right
   connection string. This is a giant hack */
export const db = new Proxy(
  drizzle('postgres://nobody@localhost:5432/nobody'),
  {
    get: (_, key) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- blindly return whatever is inside the real drizzle
      return Reflect.get(dbSingleton.value, key);
    },
  },
);

export { configSchema as databaseConfigSchema } from './config';
export * from './schema';

export const migrationsPath: string | undefined =
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- import.meta.dirname is undefined when running inside a bundle like production
  import.meta.dirname != null ? `${import.meta.dirname}/migrations` : undefined;
