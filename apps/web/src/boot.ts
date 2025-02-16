/* eslint-disable @typescript-eslint/no-floating-promises -- Nitro plugins are not async and cannot use await */

import { envNamesToConfigNames } from '@atlas/common';
import { db, migrationsPath } from '@atlas/database';
import { config } from '@dotenvx/dotenvx';
import { sql } from 'drizzle-orm';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { globSync } from 'glob';
import { APP_CONFIG } from './config';
import { logger } from './logger';

function crash(error: unknown): void {
  logger.error(error);
  process.exit(1);
}

// eslint-disable-next-line import/no-default-export -- nitro handlers must be default exported
export default (): void => {
  try {
    config();
    APP_CONFIG.bindTo(envNamesToConfigNames(process.env));
    db.execute(sql`select 1`)
      .execute()
      .then(() => {
        logger.info('Successfully connected to the database!');
      });

    let realMigrationsPath = migrationsPath;
    if (migrationsPath == null) {
      // this happens in production because everything is in a giant bundle with no import metadata
      // CWD could be anything, __dirname isn't populated, import.meta.url is shimmed nonsense due to rolldown being trash
      realMigrationsPath = globSync('**/migrations', { dot: true })[0];
    }

    if (realMigrationsPath == null) {
      crash(`Failed to find Drizzle migrations searching ${process.cwd()}`);
    } else {
      logger.info(`Applying database migrations from ${realMigrationsPath}`);
      migrate(db, { migrationsFolder: realMigrationsPath }).catch(crash);
    }
  } catch (e) {
    crash(e);
  }
};
