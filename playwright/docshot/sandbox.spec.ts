import test from "@playwright/test";
import { screenShot } from "../utilities";

test("@docshot document-injection-sandbox", async ({ page }) => {
  await page.goto("/sandbox");
  await screenShot(page, "sandbox");
});
