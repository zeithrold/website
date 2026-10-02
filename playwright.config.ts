import process from 'node:process'
import { defineConfig } from '@playwright/test'

const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  workers: 2,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    locale: 'en-US',
    colorScheme: 'light',
    trace: 'retain-on-failure',
    launchOptions: executablePath === undefined || executablePath === '' ? {} : { executablePath },
  },
  webServer: {
    command: 'pnpm start --port 4173',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: false,
    timeout: 60000,
    gracefulShutdown: { signal: 'SIGTERM', timeout: 5000 },
    env: { WRANGLER_LOG_PATH: '/tmp/ztd-homepage-wrangler-logs', WRANGLER_SEND_METRICS: 'false' },
  },
})
