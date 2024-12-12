import { defineConfig } from 'playwright/test';

export default defineConfig({
  testDir: 'tests',
  use: {
    browserName: 'firefox'
  },
  workers: process.env.CI ? 1 : undefined,
  retries: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? 'github' : [['html', { open: 'never' }]]
});
