import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  retries: 0,
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "on-first-retry",
  },
  webServer: {
    command:
      "ADMIN_PASSWORD=test-admin ADMIN_SESSION_SECRET=test-admin-session-secret NEXT_PUBLIC_SITE_URL=http://127.0.0.1:4173 NEXT_PUBLIC_WHATSAPP_BUSINESS_PHONE=6591234567 ALLOW_JSON_RESERVATION_STORE=true RESERVATION_STORE_FILE=/private/tmp/muyi-e2e-reservations.json npm run start -- --hostname 127.0.0.1 --port 4173",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: false,
    timeout: 120_000,
  },
  projects: [
    {
      name: "mobile",
      use: {
        ...devices["Pixel 5"],
        browserName: "chromium",
        viewport: { width: 390, height: 844 },
      },
    },
  ],
});
