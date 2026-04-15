import { defineConfig } from "@playwright/test"

export default defineConfig({
  testDir: "./src/tests/e2e",
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "yarn dev",
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
})
