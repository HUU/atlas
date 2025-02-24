/* eslint-disable @typescript-eslint/no-unused-vars -- Pulumi is declarative */
import * as docker from '@pulumi/docker';
import * as gcp from '@pulumi/gcp';
import * as pulumi from '@pulumi/pulumi';
import * as random from '@pulumi/random';
import { secretManagerApi } from './base-services';

export class AtlasWebService extends pulumi.ComponentResource {
  public readonly dbIpAddress: pulumi.Output<string>;
  public readonly dbName: pulumi.Output<string>;
  public readonly dbUsername: pulumi.Output<string>;
  public readonly dbPassword: pulumi.Output<string>;
  public readonly serviceAccountEmail: pulumi.Output<string>;
  public readonly dotEnvVaultSecret: pulumi.Output<string>;
  public readonly serviceUrls: pulumi.Output<string[]>;
  public readonly serviceEnvironmentVariables: pulumi.Output<
    Record<string, string>
  >;

  constructor(
    name: string,
    args: {
      project: pulumi.Input<string>;
      region: pulumi.Input<string>;
      environment: pulumi.Input<string>;
      dotenvKey: pulumi.Input<string>;
      dockerRootPath: pulumi.Input<string>;
    },
    opts: pulumi.ComponentResourceOptions = {},
  ) {
    super('atlas:WebService', name, {}, opts);

    const dotenvKeySecret = new gcp.secretmanager.Secret(
      `${name}-dotenv-key`,
      {
        secretId: `${name}-dotenv-key`,
        labels: {
          environment: args.environment,
        },
        replication: {
          auto: {},
        },
      },
      {
        dependsOn: [secretManagerApi],
        parent: this,
      },
    );
    const dotenvKeySecretValue = new gcp.secretmanager.SecretVersion(
      `${name}-dotenv-key-value`,
      {
        secret: dotenvKeySecret.id,
        secretData: args.dotenvKey,
      },
      {
        parent: this,
      },
    );

    // Public IP not private because using Cloud SQL with a VPC
    // requires private services access ($7/mo just for a proxy).
    // just to avoid a public IP ($3/mo). Will revisit later once this is sort of working
    const sqlInstance = new gcp.sql.DatabaseInstance(
      `${name}-postgres`,
      {
        databaseVersion: 'POSTGRES_14',
        settings: {
          tier: 'db-f1-micro',
          backupConfiguration: {
            enabled: true,
            startTime: '00:00', // Set the time for daily backups
          },
          userLabels: {
            environment: args.environment,
          },
        },
        region: args.region,
      },
      {
        parent: this,
      },
    );
    const dbUserPassword = new random.RandomPassword(
      'password',
      {
        length: 16,
        special: true,
        overrideSpecial: '!#$%&*()-_=+[]{}<>:?',
      },
      {
        parent: this,
      },
    );
    const dbUser = new gcp.sql.User(
      `${name}-db-user`,
      {
        instance: sqlInstance.name,
        name: 'atlas-web-db-user',
        password: dbUserPassword.result,
      },
      {
        parent: this,
      },
    );
    const database = new gcp.sql.Database(
      `${name}-db`,
      {
        instance: sqlInstance.name,
      },
      {
        parent: this,
      },
    );

    // A custom service account for running everything
    const serviceAccount = new gcp.serviceaccount.Account(
      `${name}-service-account`,
      {
        accountId: `svc-${name}`,
        displayName: name,
      },
      {
        parent: this,
      },
    );
    const secretAccessor = new gcp.projects.IAMMember(
      `${name}-secret-accessor`,
      {
        project: serviceAccount.project,
        role: 'roles/secretmanager.secretAccessor',
        member: pulumi.interpolate`serviceAccount:${serviceAccount.email}`,
      },
      {
        parent: this,
      },
    );

    const webImage = new docker.Image(
      `${name}-image`,
      {
        imageName: pulumi.interpolate`gcr.io/${args.project}/${name}:latest`,
        build: {
          context: args.dockerRootPath,
          platform: 'linux/amd64',
        },
      },
      {
        parent: this,
      },
    );
    const environmentVariables = [
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
        name: 'ATLAS_ENV',
        value: args.environment,
      },
      {
        name: pulumi
          .output(args.environment)
          .apply((s) => `DOTENV_PRIVATE_KEY_${s.toUpperCase()}`),
        valueSource: {
          secretKeyRef: {
            secret: dotenvKeySecret.secretId,
            version: dotenvKeySecretValue.version,
          },
        },
      },
    ];
    const webService = new gcp.cloudrunv2.Service(
      `${name}-cloudrun`,
      {
        name,
        location: args.region,
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
              envs: environmentVariables,
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
      {
        parent: this,
      },
    );

    const iamWebService = new gcp.cloudrun.IamMember(
      `${name}-allow-everyone`,
      {
        service: webService.name,
        location: args.region,
        role: 'roles/run.invoker',
        member: 'allUsers',
      },
      {
        parent: this,
      },
    );

    this.dbIpAddress = sqlInstance.publicIpAddress;
    this.dbName = database.name;
    this.dbUsername = dbUser.name;
    this.dbPassword = dbUserPassword.result;
    this.serviceAccountEmail = serviceAccount.email;
    this.dotEnvVaultSecret = dotenvKeySecretValue.name;
    this.serviceUrls = webService.urls;
    this.serviceEnvironmentVariables = pulumi
      .all(environmentVariables)
      .apply((vars) =>
        Object.fromEntries(
          vars.map((env) => [env.name, env.valueSource ? 'SECRET' : env.value]),
        ),
      );

    this.registerOutputs({
      dbIpAddress: this.dbIpAddress,
      dbName: this.dbName,
      dbUsername: this.dbUsername,
      dbPassword: this.dbPassword,
      serviceAccountEmail: this.serviceAccountEmail,
      dotEnvVaultSecret: this.dotEnvVaultSecret,
      serviceUrls: this.serviceUrls,
      serviceEnvironmentVariables: this.serviceEnvironmentVariables,
    });
  }
}
