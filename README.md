# WebApp Template

## 環境

- Node.js v22
- Typescript v5
- React v19
- ReactRouter v7
- TailwindCSS v4
- PostgreSQL v17
- Prisma v6

## 開発環境構築手順

### 前提条件

- dockerがインストールされていること（[Rancher Desktop](https://rancherdesktop.io/)推奨）
- [Visual Studio Code（VSCode）](https://code.visualstudio.com/download)がインストールされていること
- VSCodeに拡張機能「[Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)」がインストールされていること

### 初回セットアップ

1. 任意のフォルダに当リポジトリをクローンする
2. dockerおよびdocker-composeを実行可能状態に（RancherDesktopを起動）する
3. [環境変数](#環境変数)を設定する
4. 開発コンテナ（Dev Containers）を起動する

### ２回目以降

1. 開発コンテナ（Dev Containers）を起動する

## 環境変数

### 優先順位

| 優先度 | ファイル名              | 説明                               |
| :----: | ----------------------- | ---------------------------------- |
|   1    | .env.[`NODE_ENV`].local | `NODE_ENV`に依存するローカル値     |
|   2    | .env.local              | `NODE_NEV`に依存しないローカル値   |
|   3    | .env.[`NODE_ENV`]       | `NODE_ENV`に依存するデフォルト値   |
|   4    | .env                    | `NODE_ENV`に依存しないデフォルト値 |

※ `NODE_ENV`は開発モードでは`development`、製品モード（ビルド含む）では`production`が設定されます。  

ファイル名に`.local`が付いていないファイルがgit管理対象となります。  
各環境で値を変更する場合は、`.env*.local`を作成してください。  

### 設定値

ビルド時に静的展開（クライアントサイドで直接参照）する場合は、キーにプレフィックス（`VITE_`）を付けてください。  

| キー              | 説明                                                                    |
| ----------------- | ----------------------------------------------------------------------- |
| TZ                | タイムゾーン                                                            |
| PORT              | Webアプリケーションサーバー起動ポート番号<br>（コンテナ作成時に要設定） |
| DEV_PORT          | Webアプリケーションサーバー開発モードでの起動ポート番号                 |
| VITE_APP_MODE     | Webアプリケーション動作モード                                           |
| VITE_API_URL      | WebAPIオリジン                                                          |
| POSTGRES_USER     | データベースログインユーザー                                            |
| POSTGRES_PASSWORD | データベースログインパスワード                                          |
| POSTGRES_DB       | データベース名                                                          |
| POSTGRES_PORT     | データベース起動ポート番号                                              |

### 使い方

#### サーバーサイド（ランタイム参照）

```ts
const timezone = process.env.TZ;
```

#### クライアントサイドおよびサーバーサイド（ビルド時固定）

```ts
const apiUrl = import.meta.env.VITE_API_URL;
```

## コマンド

主要なものは`.vscode/tasks.json`に登録しています。

### Webアプリケーション起動（開発モード）

※ ホットリロードが有効です。

```bash
npm run dev
```

### Webアプリケーション起動（製品モード）

```bash
# 1 ビルド
npm run build

# 2 起動
npm run start
```

### Prisma Studio（データベース参照ツール）起動

```bash
npm run prisma
```

### データベースマイグレーション（最新化）

```bash
npm run migrate
```

### 言語ファイルからTypescriptの型情報を生成

```bash
npm run generate-i18n-types
```

### Typescript型チェック

```bash
npm run typecheck
```

### Typescript自動フォーマット

```bash
npm run format
```

### Playwright

初回のみ依存関係のインストールが必要です。  

```bash
# 依存関係のインストール
bash ./.devcontainer/initialize-playwright.sh
```

```bash
# 1. Webアプリケーションサーバーをビルドする（すでにビルド済みなら必要なし）
npm run build

# 2. Webアプリケーションサーバーを起動する（すでに起動済みなら必要なし）
npm run start

# 3. Playwright実行
npm run playwright
```

※ 各画面のスクリーンショットが、`./.playwright/screenshot/`に保存されます。  

### ロジックテスト

```bash
npm run test
```

※ 各画面のスクリーンショットが、`./.playwright/screenshot/`に保存されます。  

### 本番起動

docker-compose起動時のlocalおよびmode環境変数ファイルを取り込むため、dockerコマンドではなくシェルスクリプトを使用してください。

```bash
bash docker-compose.sh up

# 再ビルドする場合
bash docker-compose.sh up --build
```

#### シェルスクリプトから実行しない場合

`./.container/.env`と.`./.env*`を適切に設定してください。  

- `./.container/.env`：`docker-compose.yml`および実行コンテナ内に展開する環境変数
- `./.env*`：Webアプリケーションビルド時に使用する環境変数

## 開発規約

- [コーディング規約](./docs/codingStandards.md)

## ブランチ運用
