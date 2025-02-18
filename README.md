# Atlas

## TODO

### Code Complete

* Build time config schema enforcement
* NativeWind + component library
* TailWind component library (raw Radix?)
* Web libraries (forms, tanstack query)
* Web UI testing (Cypress?)
* Mobile libraries (forms, tanstack query)
  forms: React Hook Form (alt: formik, tanstack form)
* Mobile testing (Jest? why why why)
* Authentication overall (API OAuth, Web+Mobile using Google and Apple authentication)

### Production Readiness

* APM (crashes)
  * Sentry is the only real choice here.
  * Try first: Crashlytics to limit vendor sprawl?
* Metrics+Logs
  * GCP + Firebase seems to be fine for this
  * Everything else is expensive.
  * Something OTel based probably otherwise.
* Product Analytics
  * should probably just use an off-the-shelf tool like PostHog or Firebase
  * MixPanel is fine too.
* Push Notifications
  Firebase Messaging
* Switching environments inside the mobile app
* Docker + GCP via Pulumi for deployment
* Fastlane / Metro for pushing to the app stores

## DevOps

### Pulumi

`pulumi login --local` because they are are snakes.
