import { existsSync } from "node:fs";
import { resolve } from "node:path";

import { defineConfig } from "@playwright/test";

// Playwright no lee .env por sí solo (a diferencia de Next, que sí lo hace para
// el dev server que arranca `webServer`). Sin esto, los specs autenticados de
// admin quedaban en "skipped" — un falso verde. loadEnvFile no pisa variables
// ya presentes, así que en CI ganan los secretos reales.
const envFile = resolve(__dirname, ".env");
if (existsSync(envFile)) {
  process.loadEnvFile(envFile);
}

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
