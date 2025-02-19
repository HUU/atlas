# Atlas

## TODO

### Code Complete

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
* Fastlane / Metro for pushing to the app stores

## DevOps

### Pulumi

Only needed if you are manually developing/extending Pulumi code. Otherwise CI/CD should take care of it and there is no need for this.

* Create a GCP project and billing account, enable billing.
* Set up gcloud CLI `curl https://sdk.cloud.google.com | bash`
* Set up default project `gcloud config set project <YOUR_GCP_PROJECT_ID>`
* Set up ADC credentials `gcloud auth application-default login`
* Set up Docker push access `gcloud auth configure-docker`
* Run `infra/init.sh` to bootstrap Pulumi state bucket and confirm everything is ready to go.

Deployment:

* `pulumi up`
