/* eslint-disable @typescript-eslint/no-unused-vars -- Pulumi is declarative */
import * as gcp from '@pulumi/gcp';
import * as pulumi from '@pulumi/pulumi';
import * as random from '@pulumi/random';
import { hashElement } from 'folder-hash';
import {
  dotenvProductionKey,
  dotenvStagingKey,
  environment,
  region,
} from './config';

const [nodeMajor] = process.versions.node.split('.').map(Number);

const dotenvKey = new gcp.secretmanager.Secret(
  `atlas-${environment}-dotenv-key`,
  {
    secretId: `atlas-${environment}-dotenv-key`,
    labels: {
      environment,
    },
    replication: {
      auto: {},
    },
  },
);

const dotenvKeyValue = new gcp.secretmanager.SecretVersion(
  `atlas-${environment}-dotenv-key-version`,
  {
    secret: dotenvKey.id,
    secretData:
      environment === 'production'
        ? dotenvProductionKey
        : environment === 'staging'
          ? dotenvStagingKey
          : '', // this is a required value so Pulumi will error alerting you to a bad config
  },
);

// Public IP not private because using Cloud SQL with a VPC
// requires private services access ($7/mo just for a proxy)
// as well as a VM for serverless VPC access ($5/mo) if used with
// app engine (which is vastly simpler than having to build
// a container and manage a container register for Cloud Run's
// direct VPC egress). The result is a crazy $12/mo "hit" just
// to avoid a public IP ($3/mo).
const sqlInstance = new gcp.sql.DatabaseInstance(
  `atlas-${environment}-instance`,
  {
    databaseVersion: 'POSTGRES_14',
    settings: {
      tier: 'db-f1-micro',
      backupConfiguration: {
        enabled: true,
        startTime: '00:00', // Set the time for daily backups
      },
      userLabels: {
        environment,
      },
    },
    region,
  },
);

const dbUserPassword = new random.RandomPassword('password', {
  length: 16,
  special: true,
  overrideSpecial: '!#$%&*()-_=+[]{}<>:?',
});
const dbUser = new gcp.sql.User('atlas-web-db-user', {
  instance: sqlInstance.name,
  name: 'atlas-web-db-user',
  password: dbUserPassword.result,
});
const database = new gcp.sql.Database('atlas-db', {
  instance: sqlInstance.name,
});

// A GCS bucket for uploading built application bundles
const dropzoneBucket = new gcp.storage.Bucket(`atlas-${environment}-dropzone`, {
  location: region,
  labels: {
    environment,
  },
});

// Upload the built web app, assumes this has already been created by running pnpm cd:build
const builtWebZip = new gcp.storage.BucketObject(
  `atlas-${environment}-web-output.zip`,
  {
    name: `atlas-${environment}-web-output.zip`, // must end in .zip or the GAE BuildPack explodes trying to figure out how to unzip the file
    bucket: dropzoneBucket.name,
    source: new pulumi.asset.FileAsset('../apps/web/.output/deploy.zip'), // we don't use ArchiveAsset because it doesn't follow symlinks, https://github.com/pulumi/pulumi/issues/13349
  },
);
const { hash: webZipHash } = await hashElement(
  '../apps/web/.output/deploy.zip',
  {
    encoding: 'hex', // version IDs must be in [A-Za-z0-9-]
  },
);

// A custom service account for running everything
const serviceAccount = new gcp.serviceaccount.Account(
  `atlas-${environment}-web`,
  {
    accountId: `atlas-${environment}-web`,
    displayName: `Atlas Web (${environment})`,
  },
);
const gaeApi = new gcp.projects.IAMMember('gae_api', {
  project: serviceAccount.project,
  role: 'roles/compute.networkUser',
  member: pulumi.interpolate`serviceAccount:${serviceAccount.email}`,
});
const storageViewer = new gcp.projects.IAMMember('storage_viewer', {
  project: serviceAccount.project,
  role: 'roles/storage.objectViewer',
  member: pulumi.interpolate`serviceAccount:${serviceAccount.email}`,
});
const secretAccessor = new gcp.projects.IAMMember('secret_accessor', {
  project: serviceAccount.project,
  role: 'roles/secretmanager.secretAccessor',
  member: pulumi.interpolate`serviceAccount:${serviceAccount.email}`,
});

// AppEngine "takes over" the entire cloud project so you need to use this
// with a dedicated project. We could deploy staging | production | other things
// in different services but you always have to have this dumb "default" service
// for AppEngine which makes it super awkward. Multiple projects isn't a bad idea
// so we just do it. This could be avoided by switching to Cloud Run in the future
// if this suddenly becomes a real problem or blocker....but I really want to
// avoid Docker nonsense.
const appEngineApp = new gcp.appengine.Application(`atlas-${environment}-web`, {
  // oh my god https://cloud.google.com/appengine/docs/standard/locations
  locationId:
    region === 'us-central1'
      ? 'us-central'
      : region === 'europe-west1'
        ? 'europe-west'
        : region,
});

const service = new gcp.appengine.StandardAppVersion(
  `atlas-${environment}-web-service`,
  {
    service: 'default',
    runtime: `nodejs${nodeMajor}`,
    versionId: webZipHash,
    entrypoint: {
      shell: 'npm run start',
    },
    handlers: [
      // there is a permadiff here because the AppEngine API always returns a weird default handler, oh well
      // https://github.com/hashicorp/terraform-provider-google/issues/13766 example of others struggling with this
      {
        authFailAction: 'AUTH_FAIL_ACTION_REDIRECT',
        login: 'LOGIN_OPTIONAL',
        urlRegex: '.*',
        script: {
          scriptPath: 'auto',
        },
        securityLevel: 'SECURE_ALWAYS',
      },
    ],
    automaticScaling: {
      standardSchedulerSettings: {
        maxInstances: 1,
      },
    },
    envVariables: {
      ATLAS_ENV: environment,
      POSTGRES_HOST: sqlInstance.publicIpAddress,
      POSTGRES_DB: database.name,
      POSTGRES_USER: dbUser.name,
      POSTGRES_PASSWORD: dbUserPassword.result,
      [`DOTENV_PRIVATE_KEY_${environment.toUpperCase()}`]: dotenvKeyValue.name,
      //DATABASE_URL: pulumi.interpolate`postgres://${sqlInstance.connectionName}/${database.name}`,
    },
    deployment: {
      zip: {
        sourceUrl: pulumi.interpolate`https://storage.googleapis.com/${dropzoneBucket.name}/${builtWebZip.name}`,
      },
    },
    serviceAccount: serviceAccount.email,
  },
);

const trafficSplit = new gcp.appengine.EngineSplitTraffic(
  `atlas-${environment}-traffic-split`,
  {
    service: service.service,
    migrateTraffic: true,
    split: {
      shardBy: 'IP',
      allocations: service.versionId.apply((versionId) => {
        return {
          [versionId ?? 'latest']: '1.0',
        };
      }),
    },
  },
);

export const dbIpAddress = sqlInstance.publicIpAddress;
export const dbName = database.name;
export const dbUsername = dbUser.name;
export const dbPassword = dbUserPassword.result;
export const dropzoneBucketName = dropzoneBucket.name;
export const deployedZip = builtWebZip.outputName;
export const appEngineServiceAccount = serviceAccount.email;
export const appEngineServiceVersion = webZipHash;
export const dotEnvVaultSecret = dotenvKeyValue.name;
