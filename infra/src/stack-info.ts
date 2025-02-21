import '../__tests__/fake-provider';
import { AtlasWebService } from './web';

export const webServiceStaging = new AtlasWebService(`atlas-web-staging`, {
  project: 'fake-project',
  region: 'us-central1',
  environment: 'staging',
  dotenvKey: 'fake-key',
  dockerRootPath: 'fake-path',
});

export { crackOpen } from '../__tests__/helpers';
