import { defineConfig, type ViteUserConfig } from 'vitest/config';

export const defineAtlasVitestConfig = (overrides: {
  junitSuiteName?: string;
}): ViteUserConfig =>
  defineConfig({
    test: {
      include: ['src/**/*.unit.test.ts', '__tests__/**/*.test.ts'],
      reporters: [
        ['default'],
        [
          'junit',
          {
            suiteName: overrides.junitSuiteName ?? 'vitest tests',
            outputFile: `./build/junit-${overrides.junitSuiteName?.replaceAll('/', '-') ?? 'tests'}.xml`,
          },
        ],
      ],
    },
  });
