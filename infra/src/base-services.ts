import * as gcp from '@pulumi/gcp';

export const secretManagerApi = new gcp.projects.Service(
  'enable-secretmanager',
  {
    service: 'secretmanager.googleapis.com',
    disableOnDestroy: false,
  },
);
export const computeApi = new gcp.projects.Service('enable-compute', {
  service: 'compute.googleapis.com',
  disableOnDestroy: false,
});
export const runApi = new gcp.projects.Service('enable-run', {
  service: 'run.googleapis.com',
  disableOnDestroy: false,
});
export const buildApi = new gcp.projects.Service('enable-build', {
  service: 'cloudbuild.googleapis.com',
  disableOnDestroy: false,
});
