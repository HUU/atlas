import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.unit.test.ts', '__tests__/**/*.test.ts'],
  },
});
