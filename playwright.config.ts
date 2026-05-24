import { defineConfig, devices } from "@playwright/test";

const E2E_PORT = 4173;
const E2E_BASE_URL = `http://127.0.0.1:${E2E_PORT}`;
const E2E_AUTH_SECRET =
  process.env.BETTER_AUTH_SECRET ?? "test-only-playwright-auth-secret";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  timeout: 30_000,
  workers: 1,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL: E2E_BASE_URL,
    locale: "tr-TR",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    video: "retain-on-failure",
  },
  webServer: {
    command: `npm run e2e:prepare && npm run dev -- --host 127.0.0.1 --port ${E2E_PORT}`,
    env: {
      ...process.env,
      BETTER_AUTH_SECRET: E2E_AUTH_SECRET,
      BETTER_AUTH_URL: process.env.BETTER_AUTH_URL ?? E2E_BASE_URL,
    },
    reuseExistingServer: false,
    timeout: 120_000,
    url: E2E_BASE_URL,
  },
  projects: [
    {
      name: "setup",
      testMatch: /setup\/.*\.setup\.ts/,
    },
    {
      name: "chromium-public",
      testIgnore: [/setup\/.*\.setup\.ts/, /(dashboard|authorization)\.spec\.ts/],
      use: {
        ...devices["Desktop Chrome"],
      },
    },
    {
      name: "chromium-authenticated",
      dependencies: ["setup"],
      testMatch: /(dashboard|authorization)\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        storageState: "./tests/e2e/.auth/admin.json",
      },
    },
  ],
});
