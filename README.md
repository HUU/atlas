# Atlas

## TODO

### Code Complete

* MCP servers for PgSql (maybe others?) and Codium/Cursor rules to make AI not insane.
* Some ADR structure / directory for decision logs and so forth.
* NativeWind + component library
* TailWind component library (raw Radix? Flowbite?)
* Web UI testing (Cypress?)
* Mobile testing (Jest? why why why)
* Authentication overall (API OAuth, Web+Mobile using Google and Apple authentication)
* Storybook for component development
* Custom rollup extension to inject "client safe" configs into client bundles; hoist bindTo to top of client.

### Production Readiness

* Finish OTel + logging set up
  * Custom Metrics POC
  * "Wide log" for HTTP requests compatible with GCP monitoring
  * OTel exporter in Pulumi stack
* APM (crashes)
  * Sentry is the only real choice here.
  * Try first: Crashlytics to limit vendor sprawl?
* Product Analytics
  * should probably just use an off-the-shelf tool like PostHog or Firebase
  * MixPanel is fine too.
* Push Notifications
  * Firebase Messaging
* Fastlane (or Expo?) for pushing to the app stores

## Alternatives Considered

* Form library (winner: React Hook Form)
  * TanStack Form: v0/not stable.
  * Formik: less adoption than react-hook-form and as a result not all integration patterns have been fully worked out.
* Component Styling (winner: Tailwind/NativeWind)
  * CSS modules (+Mantine for components), Unistyles on Mobile: lots of boilerplate and too many files to manage, styles inlined is easier to understand if slightly overwhelming.
  * Tamagui: very custom / off-the-beaten path, not a lot of serious adoption. Instantly puts you on an island with little ability to reuse community assets.
* API Framework (winner: ts-rest)
  * trpc: wire format is kind of insane and not portable, hard requirement to use OpenAPI so it's easy to port into other implementations on client and server
* Date Manipulation (winner: date-fns)
  * moment: heavy dependency that the community as a whole has moved away from. date-fns is portable and simply wraps existing base class library.
* Logging (winner: adze)
  * Winston: hard dependency on `node:fs` that even if you avoid (by not using the filesystem logger) causes SSR frameworks like Next to explode.
  * Pino: similar issue to Winston.
  * Bunyan: doesn't work in the browser.
* ORM (winner: Drizzle)
  * Kyseley: TODO
  * Prisma: TODO
  * Knex: TODO
  * pgtyped: TODO
* State Management (winner: TanStack Query+Router)
  * Redux / Mobx: TODO
  * Zustand / Jotai: TODO
* Infrastructure as Code (winner: Pulumi)
  * Terraform: HCL is an abomination. Prefer full programming languages to DSLs.
* Production Infra (winner: Google CloudRun)
  * AppEngine: mostly worked but the API has bugs that break Terraform/Pulumi and had no ability to inject secrets from GCP Secret Manager.
* CI/CD Runtime (winner: raw GitHub actions + asdf for installing tools)
  * Docker: huge pain in the ass to use within GitHub actions, makes builds take 10-20m vs. <1m
* Config Management (winner: dotenvx)
  * Pulumi Environment Variables: TODO
  * GCP Secret Manager: TODO
  