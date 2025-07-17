import type { PlaywrightTestArgs } from "@playwright/test";

type Page = PlaywrightTestArgs["page"];

const screenShotBasePath = "./.playwright/screenshot";

export async function screenShot(page: Page, name: string) {
  await page.waitForTimeout(500);
  return page.screenshot({
    path: `${screenShotBasePath}/${name}.png`,
    fullPage: true,
  });
};
