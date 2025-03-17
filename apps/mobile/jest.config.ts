import type { JestConfigWithTsJest } from 'ts-jest';

const config: JestConfigWithTsJest = {
  // note that we have to define a `default` export type in every package.json in the workspace
  // as Jest uses node/CJS resolution rules (not `import` for ESM). Everything "still works" because
  // the TS/babel transformer takes care of the rest but you need to be able to resolve the module
  // before that can fire. If you manually patch this with `testEnvironmentOptions.customExportConditions`
  // then a bunch of random Expo/React Native dependencies explode in a ball of fire for no clear reason.
  // ...probably because they define differing export sources that suddenly get picked up unexpectedly.
  preset: 'jest-expo',
  transformIgnorePatterns: [
    // cspell:disable-next-line
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@atlas/.*)',
  ],
  moduleNameMapper: {
    // TODO: use the jest method to map this I guess and figure out why it no work.
    '^@/(.*)': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts'],
  testMatch: [
    // uses https://github.com/micromatch/micromatch, not necessarily the same as vitest's glob evaluation
    '<rootDir>/__tests__/**/*.test.(ts|tsx)',
    '<rootDir>/src/**/*.unit.test.(ts|tsx)',
  ],
  transform: {
    // jest-expo doesn't preserve env vars so we patch the default transformer...a masterclass in hating your users.
    // this also requires a custom step in setup.ts to load the vars
    // this is straight up copied out of jest-expo's preset definition (try jest --showConfig)
    '\\.[jt]sx?$': [
      'babel-jest',
      {
        caller: {
          name: 'metro',
          bundler: 'metro',
          platform: 'ios',
          preserveEnvVars: true,
        },
        configFile: require.resolve('babel-preset-expo'),
      },
    ],
  },
};

export default config;
