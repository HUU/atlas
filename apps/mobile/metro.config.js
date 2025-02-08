// Learn more https://docs.expo.io/guides/customizing-metro
// eslint-disable-next-line @typescript-eslint/no-require-imports -- Metro configs use CJS
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// support for modern 'exports' in package.json
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
