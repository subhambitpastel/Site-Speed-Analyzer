import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 120000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:3002',
    headless: false,
  },
  webServer: {
    command: 'npx next dev -p 3001',
    port: 3001,
    reuseExistingServer: true,
    timeout: 60000,
  },
});
