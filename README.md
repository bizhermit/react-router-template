# WebApp Template

## 環境

- Node.js v22
- TypeScript v5
- React v19
- ReactRouter v7
- TailwindCSS v4
- PostgreSQL v17
- Prisma v6

## 開発環境構築手順

### 前提条件

- dockerがインストールされていること（dockerおよびdocker-composeが実行可能であること）
- [Visual Studio Code（VSCode）](https://code.visualstudio.com/download)がインストールされていること
- VSCodeに拡張機能「[Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)」がインストールされていること

### 初回セットアップ

1. 任意のフォルダに当リポジトリをクローンする
2. [環境変数（開発コンテナ用）](./docs/features/env.md#開発コンテナ用)を設定する
3. 開発コンテナ（Dev Containers）を起動する

### ２回目以降

1. 開発コンテナ（Dev Containers）を起動する


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

### 言語ファイルからTypeScriptの型情報を生成

```bash
npm run generate-i18n-types
```

### OpenAPIからTypeScriptの型情報を作成

```bash
npm run generate-openapi-types
```

### TypeScript型チェック

```bash
npm run typecheck
```

### TypeScript自動整形

```bash
npm run format
```

### Playwright

初回のみ依存関係のインストールが必要です。  

```bash
# 依存関係のインストール
bash ./.devcontainer/initializePlaywright.sh
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

### 本番起動

`./.container/.env.example`を参考に、`./.container/.env`を作成してください。

```bash
bash docker-compose.sh up

# 再ビルドする場合
bash docker-compose.sh up --build
```

#### シェルスクリプトから実行しない場合

```bash
# 1. カレントディレクトリの移動
cd ./.container

# 2. 実行
docker compose up
```

## ドキュメント

- [ブランチ運用](./docs/git-branch/index.md)
- [アーキテクチャ](./docs/architectures/index.md)
- [機能仕様](./docs/features/index.md)
