import process from 'node:process'
import { defineConfig } from '@playwright/test'
import { verificationArtifacts } from '@ztd-me/frontend-checks/playwright'
import {
  websiteCanonicalTestOrigin,
  websiteCanonicalTestPort,
  websiteTestOrigin,
  websiteTestPort,
} from './tests/e2e/test-origins.ts'

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
    baseURL: websiteTestOrigin,
    locale: 'en-US',
    colorScheme: 'light',
    launchOptions: executablePath === undefined || executablePath === '' ? {} : { executablePath },
  },
  webServer: [
    {
      command: `pnpm start --port ${websiteTestPort}`,
      url: websiteTestOrigin,
      reuseExistingServer: false,
      timeout: 60000,
      gracefulShutdown: { signal: 'SIGTERM', timeout: 5000 },
      env: { WRANGLER_LOG_PATH: '/tmp/ztd-homepage-wrangler-logs', WRANGLER_SEND_METRICS: 'false' },
    },
    {
      command: `pnpm start --port ${websiteCanonicalTestPort} --canonical`,
      url: websiteCanonicalTestOrigin,
      reuseExistingServer: false,
      timeout: 60000,
      gracefulShutdown: { signal: 'SIGTERM', timeout: 5000 },
      env: { WRANGLER_LOG_PATH: '/tmp/ztd-homepage-wrangler-logs', WRANGLER_SEND_METRICS: 'false' },
    },
  ],
})
