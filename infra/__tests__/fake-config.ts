import * as pulumi from '@pulumi/pulumi';
import { vi } from 'vitest';

const testConfig = await vi.hoisted(async () => {
  const hoistImport = await import('@pulumi/pulumi');
  return class TestConfig extends hoistImport.Config {
    private configs: Record<string, any> = {
      environment: 'staging',
      dotenvKey: 'fake',
      project: 'fake-project',
      region: 'us-central1',
    };
    public readonly name: string = 'Fake-test-config';

    public setConfig(configs: Record<string, never>): pulumi.Config {
      this.configs = configs;
      return this;
    }

    public get<T extends string = string>(
      key: string,
      _opts?: pulumi.StringConfigOptions<T>,
    ): T | undefined {
      return this.configs[key] as T;
    }

    public getBoolean(key: string): boolean | undefined {
      return this.configs[key] as boolean;
    }

    public getNumber(
      key: string,
      _opts?: pulumi.NumberConfigOptions,
    ): number | undefined {
      return this.configs[key];
    }

    public getObject<T>(key: string): T | undefined {
      return this.configs[key];
    }

    public getSecret<T extends string = string>(
      key: string,
      _opts?: pulumi.StringConfigOptions<T>,
    ): pulumi.Output<T> | undefined {
      return this.configs[key];
    }

    public getSecretBoolean(key: string): pulumi.Output<boolean> | undefined {
      return this.configs[key];
    }

    public getSecretNumber(
      key: string,
      _opts?: pulumi.NumberConfigOptions,
    ): pulumi.Output<number> | undefined {
      return this.configs[key];
    }

    public getSecretObject<T>(key: string): pulumi.Output<T> | undefined {
      return this.configs[key];
    }

    public require<T extends string = string>(
      key: string,
      _opts?: pulumi.StringConfigOptions<T>,
    ): T {
      return this.getRequired(key);
    }

    public requireBoolean(key: string): boolean {
      return this.getRequired(key);
    }

    public requireNumber(
      key: string,
      _opts?: pulumi.NumberConfigOptions,
    ): number {
      return this.getRequired(key);
    }

    public requireObject<T>(key: string): T {
      return this.getRequired(key);
    }

    public requireSecret<T extends string = string>(
      key: string,
      _opts?: pulumi.StringConfigOptions<T>,
    ): pulumi.Output<T> {
      return this.getRequiredOutput(key);
    }

    public requireSecretBoolean(key: string): pulumi.Output<boolean> {
      return this.getRequiredOutput(key);
    }

    public requireSecretNumber(
      key: string,
      _opts?: pulumi.NumberConfigOptions,
    ): pulumi.Output<number> {
      return this.getRequiredOutput(key);
    }

    public requireSecretObject<T>(key: string): pulumi.Output<T> {
      return this.getRequiredOutput(key);
    }

    private getRequired<T>(key: string): T {
      const result: T = this.configs[key];

      if (result == null) {
        throw new Error(
          `key: ${key} missing from: ${JSON.stringify(this.configs)}`,
        );
      }

      return result;
    }

    private getRequiredOutput<T>(key: string): pulumi.Output<T> {
      return pulumi.Output.create(null).apply(
        async () => await this.getRequired(key),
      );
    }
  };
});

vi.mock(import('@pulumi/pulumi'), async (importOriginal) => {
  const mod = await importOriginal();
  return {
    ...mod,
    Config: testConfig,
  };
});
