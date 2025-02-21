import * as gcp from '@pulumi/gcp';
import * as pulumi from '@pulumi/pulumi';
import * as random from '@pulumi/random';
import { resourceType } from './helpers';

await pulumi.runtime.setMocks(
  {
    newResource: function (args: pulumi.runtime.MockResourceArgs): {
      id: string;
      state: any;
    } {
      let extras: object = {};
      // mock the results of actually creating/destroying resources
      // ...only support the subset used by our environment variable
      // tests.
      switch (args.type) {
        case resourceType(gcp.sql.DatabaseInstance):
          extras = {
            publicIpAddress: '1.2.3.4',
          };
          break;
        case resourceType(gcp.sql.Database):
          extras = {
            name: 'database-name',
          };
          break;
        case resourceType(random.RandomPassword):
          extras = {
            result: 'password',
          };
          break;
      }
      return {
        id: args.name + '-id',
        state: {
          ...args.inputs,
          ...extras,
        },
      };
    },
    call: function (args: pulumi.runtime.MockCallArgs) {
      return args.inputs;
    },
  },
  'atlas',
  'staging',
);
