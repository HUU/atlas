# Atlas Pulumi

Atlas runs on GCP, configured and managed by Pulumi. There is some initial set up
to store Pulumi state in GCS which the initial setup steps document, but past that
point there is no need to touch GCP manually.

## Initial Setup

* Create a GCP project and billing account, enable billing.
* Set up gcloud CLI `curl https://sdk.cloud.google.com | bash`
* Set up default project `gcloud config set project <YOUR_GCP_PROJECT_ID>`
* Set up ADC credentials `gcloud auth application-default login`
* Set up Docker push access `gcloud auth configure-docker`
* Run `infra/init.sh` to bootstrap Pulumi state bucket, secrets provider, and confirm everything is ready to go.

## Deployment

This is normally done by CI/CD but can be done manually if you followed the set up steps above.

```sh
pnpm pulumi up
```

You will need a dotenvx private key for the environment you are deploying. This is normally created when you
first encrypt a .env file (`pnpm dotenvx encrypt -f .env.staging`). This is a little bit finnicky so I may
automate it with a script to avoid the hassle.

## TODO

* SSL with a custom domain
* Hooking this up to the `deploy.yml` workflow in GitHub actions
* Probably required for any real app--
  * Mail sending
  * GCS bucket for storing uploading files (avatars)
  * Alerting (SLO, alerting, uptime monitoring aka probers)
  * Switch to private IP / VPC for the database
* Things that are probably cool to explore--
  * Structured logging with Adze
  * Custom metrics/telemetry with CloudMonitoring
