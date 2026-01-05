import { defineConfig, devices } from "@playwright/test";
import { loadEnv } from "vite";

const IS_DEV = (process.env.NODE_ENV || "").startsWith("dev");

const ENV = loadEnv(IS_DEV ? "development" : "production", process.cwd(), "");

const webServerUrl = `http://localhost:${IS_DEV ?
  (ENV.DEV_PORT || process.env.DEV_PORT || 5173) :
  (ENV.PORT || process.env.PORT || 3000)}`;

const viewports = {
  pc: {
    width: 1270,
    height: 720 - 70, // NOTE: タブ、アドレスバー等を差し引く
  },
  tablet: {
    width: 820,
    height: 1080,
  },
  sp: {
    width: 480,
    height: 960,
  },
};

export default defineConfig({
  testDir: "./playwright",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  outputDir: "./.playwright",
  use: {
    baseURL: webServerUrl,
    trace: "on-first-retry",
    launchOptions: {
      // slowMo: 500,
    },
  },
  timeout: 100000,
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: viewports.pc,
        locale: "ja",
      },
    },
    // {
    //   name: "chromium-ja",
    //   use: {
    //     ...devices["Desktop Chrome"],
    //     viewport: viewports.pc,
    //     locale: "ja",
    //   },
    // },
    // {
    //   name: "chromium-enUS",
    //   use: {
    //     ...devices["Desktop Chrome"],
    //     viewport: viewports.pc,
    //     locale: "en-US",
    //   },
    // },
    // {
    //   name: "chromium-en",
    //   use: {
    //     ...devices["Desktop Chrome"],
    //     viewport: viewports.pc,
    //     locale: "en",
    //   },
    // },
    // {
    //   name: "firefox",
    //   use: {
    //     ...devices["Desktop Firefox"],
    //     viewport: viewports.pc,
    //   },
    // },
    // {
    //   name: "webkit",
    //   use: {
    //     ...devices["Desktop Safari"],
    //     viewport: viewports.pc,
    //   },
    // },
    /* mobile viewports. */
    // {
    //   name: "Mobile Chrome",
    //   use: { ...devices["Pixel 5"] },
    // },
    // {
    //   name: "Mobile Safari",
    //   use: { ...devices["iPhone 12"] },
    // },
    /* Test against branded browsers. */
    // {
    //   name: "Microsoft Edge",
    //   use: { ...devices["Desktop Edge"], channel: "msedge" },
    // },
    // {
    //   name: "Google Chrome",
    //   use: { ...devices["Desktop Chrome"], channel: "chrome" },
    // },
  ],
  // webServer: {
  //   command: isDev ? "npm run dev" : "npm run next",
  //   url: webServerUrl,
  //   reuseExistingServer: !process.env.CI,
  // },
});
