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
//
// once tanstack start removes vinxi, this may be fixable because nitro
// entrypoint modification may be possible when using the "pure" nitro dev
// server rather than the bastardized lookalike that is vinxi dev.

import { config } from '@dotenvx/dotenvx';
const configPath = ['.env', process.env.ATLAS_ENV ?? 'development'].join('.');
config({ path: configPath });
