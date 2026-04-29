import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  reporter: "list",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
    trace: "retain-on-failure",
    video: "retain-on-failure",
  },
  // Auto-arranca el dev server si no hay uno corriendo en :3000.
  // En CI deshabilitamos este wrapper porque la pipeline gestiona el servidor
  // (o se apunta a un baseURL remoto vía PLAYWRIGHT_BASE_URL).
  webServer:
    process.env.CI || process.env.PLAYWRIGHT_BASE_URL
      ? undefined
      : {
          command: "npm run dev",
          url: "http://localhost:3000",
          reuseExistingServer: true,
          timeout: 120_000,
        },
  projects: [
    {
      name: "chromium",
      use: {
        browserName: "chromium",
        headless: true,
      },
    },
  ],
});
