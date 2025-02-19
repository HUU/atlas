import * as pulumi from '@pulumi/pulumi';

const atlasConfig = new pulumi.Config();
const gcpConfig = new pulumi.Config('gcp');

export const environment = atlasConfig.require('environment');
export const dotenvStagingKey = atlasConfig.requireSecret('dotenvStagingKey');
export const dotenvProductionKey = atlasConfig.requireSecret(
  'dotenvProductionKey',
);
export const project = gcpConfig.require('project');
export const region = gcpConfig.require('region');
