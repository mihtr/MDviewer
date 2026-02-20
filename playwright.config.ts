import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 30_000,
  retries: 1,
  reporter: 'list',
  use: {
    // Electron apps are launched per-test in the test file itself
  }
})
