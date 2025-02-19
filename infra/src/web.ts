/* eslint-disable @typescript-eslint/no-unused-vars -- Pulumi is declarative */
import * as docker from '@pulumi/docker';
import * as gcp from '@pulumi/gcp';
import * as pulumi from '@pulumi/pulumi';
import * as random from '@pulumi/random';
import { secretManagerApi } from './base-services';
import { dotenvKey, environment, project, region } from './config';

const [nodeMajor] = process.versions.node.split('.').map(Number);

const dotenvKeySecret = new gcp.secretmanager.Secret(
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
  {
    dependsOn: [secretManagerApi],
  },
);
const dotenvKeySecretValue = new gcp.secretmanager.SecretVersion(
  `atlas-${environment}-dotenv-key-version`,
  {
    secret: dotenvKeySecret.id,
    secretData: dotenvKey,
  },
);

// Public IP not private because using Cloud SQL with a VPC
// requires private services access ($7/mo just for a proxy).
// just to avoid a public IP ($3/mo). Will revisit later once this is sort of working
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

// A custom service account for running everything
const serviceAccount = new gcp.serviceaccount.Account(
  `atlas-${environment}-web`,
  {
    accountId: `atlas-${environment}-web`,
    displayName: `Atlas Web (${environment})`,
  },
);
const secretAccessor = new gcp.projects.IAMMember('secret_accessor', {
  project: serviceAccount.project,
  role: 'roles/secretmanager.secretAccessor',
  member: pulumi.interpolate`serviceAccount:${serviceAccount.email}`,
});

const webImage = new docker.Image(`atlas-${environment}-web-image`, {
  imageName: pulumi.interpolate`gcr.io/${project}/atlas-web-${environment}:latest`,
  build: {
    context: '../apps/web/.output/',
    platform: 'linux/amd64',
  },
});
const webService = new gcp.cloudrunv2.Service(
  `atlas-${environment}-web-cloudrun`,
  {
    name: `atlas-${environment}-web`,
    location: region,
    deletionProtection: false,
    ingress: 'INGRESS_TRAFFIC_ALL',
    template: {
      serviceAccount: serviceAccount.email,
      scaling: {
        maxInstanceCount: 1,
      },
      containers: [
        {
          image: webImage.imageName,
          envs: [
            {
              name: 'POSTGRES_HOST',
              value: sqlInstance.publicIpAddress,
            },
            {
              name: 'POSTGRES_DB',
              value: database.name,
            },
            {
              name: 'POSTGRES_USER',
              value: dbUser.name,
            },
            {
              name: 'POSTGRES_PASSWORD',
              value: dbUserPassword.result,
            },
            {
              name: `DOTENV_PRIVATE_KEY_${environment.toUpperCase()}`,
              valueSource: {
                secretKeyRef: {
                  secret: dotenvKeySecret.secretId,
                  version: dotenvKeySecretValue.version,
                },
              },
            },
          ],
          resources: {
            limits: {
              cpu: '1',
              memory: '512Mi',
            },
          },
        },
      ],
    },
    traffics: [
      {
        type: 'TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST',
        percent: 100,
      },
    ],
  },
);

const iamWebService = new gcp.cloudrun.IamMember('allow-everyone', {
  service: webService.name,
  location: region,
  role: 'roles/run.invoker',
  member: 'allUsers',
});

export const dbIpAddress = sqlInstance.publicIpAddress;
export const dbName = database.name;
export const dbUsername = dbUser.name;
export const dbPassword = dbUserPassword.result;
export const serviceAccountEmail = serviceAccount.email;
export const dotEnvVaultSecret = dotenvKeySecretValue.name;
export const webServiceUrls = webService.urls;
