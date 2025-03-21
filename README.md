# Atlas

## TODO

### Code Complete

* NativeWind + component library
* TailWind component library (raw Radix? Flowbite?)
* Add form example to web and mobile, remove react-hook-form .depcheckrc exemptions
* Web UI testing (Cypress?)
* Storybook for component development

Nice to have:

* * Authentication overall (API OAuth, Web+Mobile using Google and Apple authentication)

### Production Readiness

* Finish OTel + logging set up
  * "Wide log" for HTTP requests compatible with GCP monitoring
  * OTel exporter in Pulumi stack
* Firebase it up
  * Crashlytics (sentry alt)
  * GA (PostHog alt)
  * Remote Config (PostHog alt)
  * FCM (push notifications)
* Fastlane (or Expo?) for pushing to the app stores
* Wire up deploys into deploy.yml workflow

### Wrap Up

* Documentation
  * Complete README
  * MCP servers for PgSql (maybe others?) and Codium/Cursor rules to make AI not insane.
  * Some ADR structure / directory for decision logs and so forth.

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
* TS Scripts Runtime (winner: TSX)
  * ts-node: blows with ES Modules and way too much config, slow.
    * exception: ts-node is needed to utilize `jest.config.ts` instead of raw JS Jest configs.
* Test Runner (winner: vitest)
  * jest: Requires a crap load of configuration to make ES Modules and transpilation work, slow
    * exception: React Native testing requires Jest, there are many many many mocks and bindings from Expo/RN that have no Vitest equivalent.
