import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1, // SQLite backend doesn't support concurrent writes
  reporter: 'html',
  globalSetup: './tests/global.setup.ts',
  use: {
    baseURL: 'http://localhost:3000',
    actionTimeout: 10000,
  },
  projects: [
    {
      name: 'e2e',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
});
