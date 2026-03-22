import { defineConfig, devices } from "@playwright/test";

const E2E_PORT = 4173;
const E2E_BASE_URL = `http://127.0.0.1:${E2E_PORT}`;

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
      testIgnore: [/setup\/.*\.setup\.ts/, /dashboard\.spec\.ts/],
      use: {
        ...devices["Desktop Chrome"],
      },
    },
    {
      name: "chromium-authenticated",
      dependencies: ["setup"],
      testMatch: /dashboard\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        storageState: "./tests/e2e/.auth/admin.json",
      },
    },
  ],
});
