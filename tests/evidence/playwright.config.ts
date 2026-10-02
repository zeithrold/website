import process from 'node:process'
import { defineConfig } from '@playwright/test'
import { verificationArtifacts } from '@ztd-me/frontend-checks/playwright'

const artifacts = verificationArtifacts()
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH

export default defineConfig({
  ...artifacts,
  testDir: '.',
  testMatch: 'a11y-failure.spec.ts',
  workers: 1,
  retries: 0,
  use: {
    ...artifacts.use,
    launchOptions: executablePath === undefined || executablePath === '' ? {} : { executablePath },
  },
})
