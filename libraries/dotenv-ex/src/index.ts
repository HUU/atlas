import * as dotenv from 'dotenv';
import findConfig from 'find-config';

/**
 * Calls dotenv.config (thereby loading .env variables into process.env) but
 * searches up recursively for .env or .env.vault files...this allows us to share
 * a single secret store for the entire monorepo.
 */
export function configureDotEnvForMonorepo(): void {
  // only run this code on the server side.
  const envFilePath =
    process.env.DOTENV_KEY == null
      ? findConfig('.env')
      : findConfig('.env.vault'); // no .env in prod, but there is a .vault

  if (envFilePath !== null) {
    dotenv.config({ path: envFilePath });
  } else {
    // no .env or .env.vault file? fallback and hope for the best.
    dotenv.config();
  }
}
