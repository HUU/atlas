/* eslint-disable @typescript-eslint/no-unused-vars -- pulumi configs are declarative */
import * as gcp from '@pulumi/gcp';
import * as pulumi from '@pulumi/pulumi';
import * as random from '@pulumi/random';

const config = new pulumi.Config('gcp');
const project = config.require('project');
const region = config.require('region');

// Public IP not private because using Cloud SQL with a VPC
// requires private services access ($7/mo just for a proxy)
// as well as a VM for serverless VPC access ($5/mo) if used with
// app engine (which is vastly simpler than having to build
// a container and manage a container register for Cloud Run's
// direct VPC egress). The result is a crazy $12/mo "hit" just
// to avoid a public IP ($3/mo).
const sqlInstance = new gcp.sql.DatabaseInstance('atlas-instance', {
  databaseVersion: 'POSTGRES_14',
  settings: {
    tier: 'db-f1-micro',
    backupConfiguration: {
      enabled: true,
      startTime: '00:00', // Set the time for daily backups
    },
  },
  region,
});
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

const appEngineApp = new gcp.appengine.Application('atlas-web', {
  // oh my god https://cloud.google.com/appengine/docs/standard/locations
  locationId:
    region === 'us-central1'
      ? 'us-central'
      : region === 'europe-west1'
        ? 'europe-west'
        : region,
});

/*
const service = new gcp.appengine.StandardAppVersion('my-service', {
  service: 'default',
  runtime: 'nodejs14',
  entrypoint: {
    shell: 'npm start',
  },
  handlers: [
    {
      urlRegex: '/.*',
      script: {
        scriptPath: 'auto',
      },
      secure: 'always',
    },
  ],
  automaticScaling: {
    standardSchedulerSettings: {
      maxInstances: 1,
    },
  },
  envVariables: {
    DATABASE_URL: pulumi.interpolate`postgres://${sqlInstance.connectionName}/${database.name}`,
  },
  deployment: {
    files: {
      'app.js': {
        sourceUrl: pulumi.interpolate`https://storage.googleapis.com/${project}.appspot.com/app.js`,
      },
    },
  },
});

// Enable HTTPS with a Google-managed SSL certificate
const sslCert = new gcp.appengine.DomainMapping('my-domain-mapping', {
  domainName: pulumi.interpolate`${service.url}.appspot.com`,
  sslSettings: {
    sslManagementType: 'AUTOMATIC',
  },
});
*/

// named exports become the Stack outputs
export const dbIpAddress = sqlInstance.publicIpAddress;
export const dbName = database.name;
export const dbUsername = dbUser.name;
export const dbPassword = dbUserPassword.result;
