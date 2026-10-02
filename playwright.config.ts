import process from 'node:process'
import { defineConfig } from '@playwright/test'
import { verificationArtifacts } from '@ztd-me/frontend-checks/playwright'

const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
const artifacts = verificationArtifacts()

export default defineConfig({
  ...artifacts,
  testDir: './tests/e2e',
  fullyParallel: true,
  workers: 2,
  retries: 0,
  use: {
    ...artifacts.use,
    baseURL: 'http://127.0.0.1:4173',
    locale: 'en-US',
    colorScheme: 'light',
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
