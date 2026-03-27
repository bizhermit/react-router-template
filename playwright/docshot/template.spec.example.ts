import test from "@playwright/test";
import { screenShot } from "../utilities";

// 画面定義書向けの注入画像を生成するテンプレート。
// 利用時は本ファイルをコピーし、ファイル名を *.spec.ts に変更して使う。
// 例: playwright/docshot/settings.spec.ts

test("@docshot screen-id-purpose", async ({ page }) => {
  // 画面に到達するための最低限の遷移だけを記述する。
  await page.goto("/replace-path");

  // 命名規約: 画面ID_用途
  await screenShot(page, "screen-id_purpose");
});
