import test from "@playwright/test";
import { screenShot } from "./utilities";

test("document-injection-screenshots", async ({ page }) => {
  await page.goto("/");
  await screenShot(page, "index");
  await page.goto("/sandbox");
  await screenShot(page, "sandbox");
});
