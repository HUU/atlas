import { defineConfig } from '@tanstack/start/config';

export default defineConfig({
  tsr: {
    appDirectory: 'src',
  },
  server: {
    preset: './gcp', // custom preset to generate a zip that works with CloudRun/AppEngine deployment from source
    plugins: ['./src/boot.ts'],
  },
}).then((config) =>
  config.addRouter({
    type: 'http',
    name: 'restApi',
    base: '/api',
    handler: './src/api/__handler.ts',
    target: 'server',
  }),
);
