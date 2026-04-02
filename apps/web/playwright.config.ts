import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  expect: {
    timeout: 10_000
  },
  fullyParallel: true,
  use: {
    baseURL: "http://127.0.0.1:3001",
    trace: "retain-on-failure"
  },
  webServer: {
    command: "pnpm exec next dev -H 127.0.0.1 -p 3001",
    cwd: __dirname,
    url: "http://127.0.0.1:3001/login",
    reuseExistingServer: true,
    timeout: 120_000
  },
  projects: [
    {
      name: "desktop",
      use: {
        ...devices["Desktop Chrome"]
      }
    }
  ]
});
