// this file will be injected into the very beginning of the nitro entrypoint in
// production (not in dev, under Vinxi)
//
// this helps us load the .env file without having to ship the dotenvx CLI inside
// our prod container. While feasible, there was no great way to do this, either it
// meant doing a pnpm --shamefully-hoist install inside the deploy directory
// (which would slow down builds and make the bundle huge) OR checking in the
// dotenvx self-container binary and shipping that (adding 50MiB to our git
// repo...making EVERYTHING slow and sad).
//
// this is a compromise where under dev we use the dotenvx CLI and in prod
// we inject something that behaves almost identically...good enough!

import { config } from '@dotenvx/dotenvx';
const configPath = ['.env', process.env.ATLAS_ENV ?? 'development'].join('.');
config({ path: configPath });
