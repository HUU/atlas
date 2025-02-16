import { defineConfig } from '@tanstack/start/config';

export default defineConfig({
  tsr: {
    appDirectory: 'src',
  },
  server: {
    plugins: ['./src/boot.ts'],
  },
}).addRouter({
  type: 'http',
  name: 'restApi',
  base: '/api',
  handler: './src/api/__handler.ts',
  target: 'server',
});
