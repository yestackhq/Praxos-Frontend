import { defineConfig, devices } from "@playwright/test";

/** E2E config. Reuses the running Vite dev server on :5173 when present. */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:5174",
    trace: "off",
    viewport: { width: 1280, height: 900 },
    colorScheme: "dark",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // Dedicated server on :5174 with Clerk disabled, so the suite exercises every
  // screen in review mode (open routes) regardless of the dev .env.
  webServer: {
    command: "VITE_CLERK_PUBLISHABLE_KEY= VITE_API_ORIGIN= vite --port 5174 --strictPort",
    url: "http://localhost:5174",
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
