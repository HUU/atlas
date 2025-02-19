/* eslint-disable @typescript-eslint/no-unused-vars -- Pulumi is declarative */
import * as gcp from '@pulumi/gcp';

// enable base services
const secretManagerApi = new gcp.projects.Service('enable-secretmanager', {
  service: 'secretmanager.googleapis.com',
  disableOnDestroy: false,
});
const computeApi = new gcp.projects.Service('enable-compute', {
  service: 'compute.googleapis.com',
  disableOnDestroy: false,
});
const runApi = new gcp.projects.Service('enable-run', {
  service: 'run.googleapis.com',
  disableOnDestroy: false,
});
const buildApi = new gcp.projects.Service('enable-build', {
  service: 'cloudbuild.googleapis.com',
  disableOnDestroy: false,
});

export * from './web';
