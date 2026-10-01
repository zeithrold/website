import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  workers: 2,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:4173", locale: "en-US", colorScheme: "light",
    trace: "retain-on-failure",
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH } : {},
  },
  webServer: {
    command: "pnpm start --port 4173",
    url: "http://127.0.0.1:4173", reuseExistingServer: false, timeout: 60000,
    env: { WRANGLER_LOG_PATH: "/tmp/ztd-homepage-wrangler-logs", WRANGLER_SEND_METRICS: "false" },
  },
});
