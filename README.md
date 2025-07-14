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
2. dockerおよびdocker-composeを実行可能状態にする
   - RancherDesktopを起動する
3. 開発コンテナの環境変数を設定する
   - `.devcontainer/.env.example`を参考に`.devcontainer/.env`を作成する
   - `.env`またはキーが未作成の場合、デフォルト値が使用される
4. 開発コンテナ（Dev Containers）を起動する

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
# 1
npm run build

#2
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
