import test from "@playwright/test";
import { screenShot } from "./utilities";

test("screenshots", async ({ page }) => {
  await page.goto("/");
  await screenShot(page, "index");
  await page.goto("/sandbox");
  await screenShot(page, "sandbox");
});
