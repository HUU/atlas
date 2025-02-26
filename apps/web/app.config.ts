import { defineConfig } from '@tanstack/start/config';
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
    // custom preset to generate a zip that works with CloudRun/AppEngine deployment from source
    preset: './gcp',
    // note these plugins run in a custom vinxi vite ssr "environment" when booting the dev server
    // not Nitro. This means a ton of "nitro features" just straight up don't work, like
    // vite ts import aliases
    plugins: ['./src/boot.ts', './src/observability/opentelemetry.ts'],
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
