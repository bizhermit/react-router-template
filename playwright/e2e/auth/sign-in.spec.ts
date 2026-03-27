import { expect, test } from "@playwright/test";

// 前提: scripts/seed.ts で admin@example.com / password が登録済みであること

test.describe("サインインフロー", () => {
  test("正常系(JS有効): 正しい認証情報でホームに遷移する", async ({ page }) => {
    await page.goto("/sign-in");

    await page.getByLabel("MailAddress").fill("admin@example.com");
    await page.getByLabel("Password").fill("password");
    await page.getByRole("button", { name: "Sign In" }).click();

    // JS 有効時は SPA 遷移になるため、URL 変化を直接待機する
    await expect(page).toHaveURL(/\/home(?:\?|$)/, { timeout: 15000 });
  });

  test("異常系(JS有効): 誤ったパスワードではエラーメッセージが表示され遷移しない", async ({ page }) => {
    await page.goto("/sign-in");

    await page.getByLabel("MailAddress").fill("admin@example.com");
    await page.getByLabel("Password").fill("wrong-password");

    await page.getByRole("button", { name: "Sign In" }).click();

    // /sign-in から遷移しないことを確認
    await expect(page).toHaveURL(/\/sign-in(?:\?|$)/);
    // エラーメッセージが表示されることを確認
    await expect(page.locator("._ipt-msg")).toBeVisible({ timeout: 15000 });
  });

  test("正常系(JS無効): 正しい認証情報でホームに遷移する", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();

    try {
      await page.goto("/sign-in");

      await page.getByLabel("MailAddress").fill("admin@example.com");
      await page.getByLabel("Password").fill("password");
      await page.getByRole("button", { name: "Sign In" }).click();

      // JS 無効では通常の form submit(action) として遷移することを確認
      await page.waitForURL("/home");
      await expect(page).toHaveURL("/home");
    } finally {
      await context.close();
    }
  });

  test("異常系(JS無効): 誤ったパスワードではエラーメッセージが表示され遷移しない", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();

    try {
      await page.goto("/sign-in");

      await page.getByLabel("MailAddress").fill("admin@example.com");
      await page.getByLabel("Password").fill("wrong-password");
      await page.getByRole("button", { name: "Sign In" }).click();

      // JS 無効でも /sign-in に留まり、エラー表示されることを確認
      await expect(page).toHaveURL(/\/sign-in(?:\?|$)/);
      await expect(page.locator("._ipt-msg")).toBeVisible();
    } finally {
      await context.close();
    }
  });
});
