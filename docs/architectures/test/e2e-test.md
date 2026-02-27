# E2E テスト仕様

ブラウザ・サーバー・DB・外部サービススタブを含むシステム全体の振る舞いを検証するための指示書。Playwright を標準ツールとし、本番に近い環境構成で重要ユーザーフローを保証する。全体構成は [docs/architectures/test/index.md](./index.md) を参照。

> **CI 実行**: E2E テストは `npm run playwright` で実行する。CI ではサーバー起動タスク後に同コマンドを叩き、失敗時は Playwright Trace とスクリーンショットを確認する。

## クイックスタート

1. **フロー選定** — サインイン/CRUD/決済などビジネスクリティカルなフローを優先し、ステップを列挙する。
2. **環境起動** — `npm run dev` または本番同等の Docker Compose を立ち上げ、Playwright Config で接続先を指定する。
3. **テストデータ用意** — API / DB シードを使い、アカウント・初期データ・Feature Flag を整備する。
4. **シナリオ実装** — Page Object / Helper を使って画面遷移を記述し、スクリーンショット・ネットワークログを取得する。
5. **後片付け** — 生成したデータやセッションを削除し、次回実行でも同じ状態になるよう整える。

> **Checklist**
> - [ ] 最重要フローがすべてカバーされている（Happy + 代表的な異常系）
> - [ ] Page Object を利用して DOM 依存を局所化している
> - [ ] 外部 API 呼び出しは Playwright の `route` 機能でスタブされ、期待通りのリクエスト内容を検証できている
> - [ ] スクリーンショット/動画/ログが CI で保存され、失敗時に追跡可能
> - [ ] テストデータの作成・削除が自動化され、リトライしても汚染が残らない

## 環境構成

| 項目       | 推奨アプローチ                                                                            |
| ---------- | ----------------------------------------------------------------------------------------- |
| アプリ起動 | `npm run dev` または `Start WebApp(dev)` タスクでサーバーを起動                           |
| DB         | `npm run dev:migrate` + `npm run dev:postgres` で本番同等のスキーマを用意                 |
| Playwright | `playwright.config.ts` で baseURL, viewport, retries, trace 設定を行う                    |
| シード     | `scripts/seed.ts` でアカウント/テストデータを投入                                         |
| Secrets    | `.env.playwright` にテスト用クレデンシャルを保持し、Playwright の `defineConfig` から参照 |

## データ戦略

- **IDEMPOTENT**: 各テストは自分で作成したレコードのみ削除するか、専用のテスト用テナントを使用する。
- **シード階層**: グローバルに必要なデータを `scripts/seed.ts` で投入し、ケース固有データはテスト内で API を通して作成する。
- **クリーンアップ**: Playwright の `test.step` などを使い、失敗時にも後片付けが実行されるよう `try/finally` を徹底する。

## 外部サービスとネットワーク

- Playwright の `route` で特定の HTTP リクエストをスタブし、レスポンスを固定する。実外部サービスはヒットさせない。
- OAuth/ID プロバイダはテスト用モックエンドポイントまたは Magic Link を使用し、ユーザーが手動操作しない。
- Webhook/イベントは内部エンドポイントへ直接 POST し、UI が更新されるまで待機して検証する。

## セキュリティ・監査

- CSP, セキュリティヘッダー, Cookie 属性を `page.waitForResponse` などで検証する。
- 画面上にシークレットやデバッグ情報が表示されていないことをスクリーンショットで確認する。
- ログイン後のページ遷移で XSS/CSRF 防御が正しく働いているか、特定の URL を叩いてチェックする。

## ターゲット別ガイド

### 認証フロー

- サインイン/サインアウト/トークン更新/セッション失効を 1 セットで検証する。
- メールリンク/2FA が絡む場合はモックメールボックスを用意し、リンクの検証を自動化する。

### CRUD 画面

- Create → Read → Update → Delete の順で実行し、DB 反映を API で確認する。
- フィルタリングや並び替えの結果が UI とバックエンドレスポンスで一致しているかを検証する。

### 設定/フォーム画面

- バリデーションエラー表示、ページ離脱時のダイアログ、アクセシビリティに配慮したフォーカス遷移を確認する。
- ファイルアップロードは Playwright の `setInputFiles` を利用し、サーバー側のレスポンスまで追う。

## 観測と診断

- Playwright の `trace:on` を有効化し、CI 失敗時に `.zip` をアーティファクトとして保存する。
- `test.slow()` を正しく設定し、閾値を超えるケースはパフォーマンス退行として検出する。
- `console` イベントを監視し、エラー/警告が発生していればテストを失敗させる。

## ケーススタディ: サインイン → ホーム画面

- 対象: `/sign-in` → `/home` の Happy Path。
- テスト配置案: [playwright/screenshot.spec.ts](../../playwright/screenshot.spec.ts)

| ステップ | 操作                                 | 期待する結果                                      |
| -------- | ------------------------------------ | ------------------------------------------------- |
| 1        | `/sign-in` にアクセス                | ログインフォームが表示される                      |
| 2        | メールアドレス/パスワード入力 → 送信 | ダッシュボードにリダイレクトし、API が 200 を返す |
| 3        | ホームカードをクリック               | 詳細ページに遷移し、URL とパンくずが更新される    |

### 推奨テスト実装スケッチ

```ts
import { test, expect } from '@playwright/test';

test.describe('Sign-in flow', () => {
  test('ユーザーがログインしダッシュボードを見る', async ({ page }) => {
    await page.goto('/sign-in');
    await page.getByLabel('メールアドレス').fill('user@example.com');
    await page.getByLabel('パスワード').fill('password');
    await page.getByRole('button', { name: 'ログイン' }).click();

    await expect(page).toHaveURL('/home');
    await expect(page.getByRole('heading', { name: 'ホーム' })).toBeVisible();
  });
});
```

### セキュリティ/非機能チェック

- セッション Cookie に `Secure` / `HttpOnly` / `SameSite` 設定があるか `page.context().cookies()` で確認する。
- 重要画面では `page.screenshot` を取得し、視覚的なレグレッションを比較できるようにする。
- テスト時間が長くなる場合はシナリオを分割し、並列実行できる構成を検討する。

## AI エージェント手順

1. ビジネスフローを整理し、シナリオごとに Page Object を作成する。
2. Playwright 設定に `trace: 'on-first-retry'` を有効化し、デバッグ可能な成果物を常に残す。
3. 外部サービスやメール送信は `route` でスタブし、受信内容を断言する。
4. 画面遷移とバックエンドレスポンスを双方検証し、意図しない API エラーを検知する。
5. 終了後はデータクリーニングを実行し、再実行可能な状態を維持する。

## 参考

- Playwright 設定: [playwright.config.ts](../../playwright.config.ts)
- テストユーティリティ: [playwright/utilities.ts](../../playwright/utilities.ts)
- セキュリティチェックリスト: [docs/architectures/security-checklist.md](../security-checklist.md)
