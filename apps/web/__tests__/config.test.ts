import { APP_CONFIG } from '@/config';
import { assertConfigIsValidOrThrow } from '@atlas/common';
import { crackOpen, webServiceStaging } from '@atlas/infra/stack-info';
import { config } from '@dotenvx/dotenvx';
import { describe, test } from 'vitest';

describe('staging configuration', () => {
  test('will parse completely', async () => {
    const pulumiEnvVars = await crackOpen(
      webServiceStaging.serviceEnvironmentVariables,
    );
    const { parsed: dotEnvVars } = config({ path: '.env.staging' });

    const effectiveEnvVars = {
      ...pulumiEnvVars,
      ...dotEnvVars,
    };

    assertConfigIsValidOrThrow(APP_CONFIG, effectiveEnvVars, {
      errorMessage:
        'Configuration does not parse correctly; this can ' +
        'indicate that a required environment variable is ' +
        'missing from a .env file or is not being injected ' +
        'into the container (check the Pulumi stack).\n',
    });
  });
});
