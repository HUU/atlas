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
    preset: './gcp', // custom preset to generate a zip that works with CloudRun/AppEngine deployment from source
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
