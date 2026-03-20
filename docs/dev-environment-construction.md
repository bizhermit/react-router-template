# 開発環境構築手順

## 前提条件

開発コンテナを使用します。

- dockerがインストールされていること（dockerおよびdocker composeが実行可能であること）
- gitがインストールされており、リモート接続にSSHを使用し、ssh-agentが有効であること（開発コンテナ内ではホストのSSHをエージェント経由で使用する）
- [Visual Studio Code（VSCode）](https://code.visualstudio.com/download)がインストールされていること
- VSCodeに拡張機能「[Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)」がインストールされていること

## 初回セットアップ

1. 任意のフォルダに当リポジトリをクローンする
2. 環境変数ファイルを作成する（参照：[環境変数](./features/env.md)）
3. 開発コンテナ（Dev Containers）を起動する

## ２回目以降

1. 開発コンテナ（Dev Containers）を起動する

## 開発コンテナを使用しない場合

1. 任意のフォルダに当リポジトリをクローンする
2. [Node.js](https://nodejs.org/ja/download)をインストールする
3. 依存関係をインストールする
	```bash
	npm install --no-package-lock
	```
4. データベース（コンテナ）を起動する
	```bash
	npm run dev:postgres
	```
5. マイグレーションを実行する
	```bash
	npm run dev:migrate
	```
6. 初回データを投入する
	```bash
	npm run postgres:init
	```
