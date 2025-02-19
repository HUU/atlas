import * as pulumi from '@pulumi/pulumi';

const atlasConfig = new pulumi.Config();
const gcpConfig = new pulumi.Config('gcp');

export const environment = atlasConfig.require('environment');
export const dotenvKey = atlasConfig.requireSecret('dotenvKey');
export const project = gcpConfig.require('project');
export const region = gcpConfig.require('region');
