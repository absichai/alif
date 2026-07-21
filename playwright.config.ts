import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "html",
  use: {
    baseURL: "http://localhost:3107",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run dev -- --hostname localhost --port 3107",
    url: "http://localhost:3107",
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    {
      name: "public-chromium",
      testMatch: /e2e\/onboarding\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "public-mobile",
      testMatch: /e2e\/onboarding\.spec\.ts/,
      use: { ...devices["iPhone 13"], browserName: "chromium" },
    },
    {
      name: "auth-setup",
      testMatch: /global\.setup\.ts/,
    },
    {
      name: "authenticated-chromium",
      testMatch: /e2e\/(journey|assistant)\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        storageState: "playwright/.clerk/user.json",
      },
      dependencies: ["auth-setup"],
    },
  ],
});
