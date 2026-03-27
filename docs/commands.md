# コマンド一覧

主要なものは `.vscode/tasks.json` に登録しています。

## npm scripts

### アプリケーション

| コマンド           | 説明                                                                                                                               |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| `npm run dev`      | 開発サーバーを起動します。ホットリロードが有効です。                                                                               |
| `npm run prebuild` | ビルド前処理として `generate:i18n-types` と `generate:openapi-types` を実行します。通常は `npm run build` の中で自動実行されます。 |
| `npm run build`    | Webアプリケーションをビルドします。実行前に `prebuild` が自動実行されます。                                                        |
| `npm run start`    | ビルド済みのアプリケーションを起動します。事前に `npm run build` が必要です。                                                      |

#### Webアプリケーション起動（製品モード）

```bash
# 1. ビルド
npm run build

# 2. 起動
npm run start
```

### 型生成・コード生成

| コマンド                         | 説明                                                                                                            |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `npm run generate:i18n-types`    | `public/locales` の言語ファイルから TypeScript の型定義を生成します。                                           |
| `npm run generate:openapi`       | `docs/api` 配下の TypeScript 定義から OpenAPI の YAML を生成します。                                            |
| `npm run generate:openapi-types` | OpenAPI YAML を生成し、その内容から TypeScript の型定義を生成します。                                           |
| `npm run generate:auth-schema`   | better-auth の設定から認証スキーマを生成します。                                                                |
| `npm run typecheck:rebuild`      | 型生成と React Router の typegen をやり直したうえで型チェックを実行します。生成物を更新した直後の確認向けです。 |

### データベース・補助スクリプト

| コマンド                     | 説明                                                                                          |
| ---------------------------- | --------------------------------------------------------------------------------------------- |
| `npm run generate:migration` | Drizzle のマイグレーションファイルを生成します。                                              |
| `npm run dev:migrate`        | Drizzle のマイグレーションを実行し、データベースを最新化します。                              |
| `npm run dev:postgres`       | 開発用 PostgreSQL コンテナを起動します。                                                      |
| `npm run dev:postgres:down`  | 開発用 PostgreSQL コンテナを停止し、関連コンテナを終了します。                                |
| `npm run postgres:init`      | 初期データを投入します。現在は管理ユーザーのシードを実行します。                              |
| `npm run build:seed`         | `scripts/seed.ts` を Node 実行用のバンドルに変換します。                                      |
| `npm run build:migrate`      | `scripts/migrate.ts` を Node 実行用のバンドルに変換します。                                   |
| `npm run build:scripts`      | `build:seed` と `build:migrate` をまとめて実行します。Docker イメージ作成時の補助に使います。 |

### 検証・テスト

| コマンド                     | 説明                                                               |
| ---------------------------- | ------------------------------------------------------------------ |
| `npm run typecheck`          | TypeScript 型チェックと ESLint を実行します。                      |
| `npm run format`             | ESLint の自動修正を実行します。                                    |
| `npm run test`               | `src` 配下の Vitest を実行します。                                 |
| `npm run playwright`         | Playwright の E2E テストを実行します（資料画像生成テストは除外）。 |
| `npm run playwright:e2e`     | E2E 品質ゲート用テストのみを実行します。                           |
| `npm run playwright:docshot` | 画面定義書向けの注入画像生成テストのみを実行します。               |

#### Playwright

初回のみ依存関係のインストールが必要です。

```bash
# 依存関係のインストール
bash ./.devcontainer/initializePlaywright.sh
```

```bash
# 1. Webアプリケーションサーバーをビルドする（すでにビルド済みなら不要）
npm run build

# 2. Webアプリケーションサーバーを起動する（すでに起動済みなら不要）
npm run start

# 3. Playwright 実行（E2E 品質ゲート）
npm run playwright
```

> 注意: `npm run dev` は初回コンパイルやウォッチ再ビルドの影響で、起動直後の E2E が不安定になる場合があります。安定性を優先する場合（特に CI）は `npm run build` + `npm run start` を基本にしてください。

各画面のスクリーンショットは `./.playwright/screenshot/` に保存されます。

注入画像のみを更新したい場合は、次を実行します。

```bash
npm run playwright:docshot
```

### UI 開発

| コマンド                  | 説明                                                                      |
| ------------------------- | ------------------------------------------------------------------------- |
| `npm run storybook`       | Storybook 開発サーバーをポート 6006 で起動します。                        |
| `npm run build-storybook` | Storybook の静的ファイルを `./.artifacts/storybook-static` に出力します。 |

## npm scripts 以外の補助コマンド

### 本番起動

```bash
bash docker-compose.sh up

# 再ビルドする場合
bash docker-compose.sh up --build
```

