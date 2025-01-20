import { defineConfig } from '@tanstack/start/config';

export default defineConfig({
  tsr: {
    appDirectory: 'src',
  },
  server: {
    plugins: ['./app.boot.ts'],
  },
}).addRouter({
  type: 'http',
  name: 'restApi',
  base: '/api',
  handler: './api.handler.ts',
  target: 'server',
});
