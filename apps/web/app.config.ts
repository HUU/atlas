import { defineConfig } from '@tanstack/react-start/config';
import tsConfigPaths from 'vite-tsconfig-paths';

const supportImportAliasesFromTsConfig = tsConfigPaths({
  projects: ['./tsconfig.json'],
});

export default defineConfig({
  vite: {
    plugins: [supportImportAliasesFromTsConfig],
  },
  tsr: {
    appDirectory: 'src',
  },
  server: {
    // modules only sort of work in vinxi dev; plugins injected by the module are not "re-collected"
    // by vinxi so they never get initialized...instead we jut don't use modules and add stuff piecemeal
    // here.
    //
    preset: '@atlas/nitro/gcp-preset',
    gcp: {
      includeFiles: ['.env.*', '../../libraries/database/migrations'],
      excludeFiles: ['.env.keys'],
    },
    //
    // note these plugins run in a custom vinxi vite ssr "environment" when booting the dev server
    // not Nitro. This means a ton of "nitro features" just straight up don't work, like
    // vite ts import aliases
    plugins: ['./src/boot.ts', '@atlas/nitro/opentelemetry'],
  },
}).then((config) => {
  return config.addRouter({
    type: 'http',
    name: 'restApi',
    base: '/api',
    handler: './src/api/__handler.ts',
    target: 'server',
    plugins: () => [supportImportAliasesFromTsConfig], // this has to be manually patched in here, Tanstack Start normally adds this to the "built-in" routes above
  });
});
