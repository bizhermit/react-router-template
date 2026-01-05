# 環境変数

`./docker/.env.example`を参考に、`./docker/.env`を作成してください。  

※ コンテナの環境変数と整合性を確保するため、viteで使用できる`.env.*`は使用不可とします。

## 設定値

- r: 必須
- o: 任意
- -: 未使用

| 本番  | 開発  | キー               | 説明                                                                           |
| :---: | :---: | ------------------ | ------------------------------------------------------------------------------ |
|   -   |   o   | UID                | uid（Linux系の場合必須）                                                       |
|   -   |   o   | GID                | gid（Linux系の場合必須）                                                       |
|   -   |   o   | COMPOSE_PROJECT_NAME    | docker composeのプロジェクト名 |
|   o   |   o   | TZ                 | タイムゾーン                                                                   |
|   -   |   o   | LOCALHOST          | LOCALHOST                                                                      |
|   o   |   o   | PORT               | アプリケーションサーバー起動ポート                                             |
|   -   |   o   | DEV_PORT           | アプリケーションサーバーdev起動ポート                                          |
|   o   |   o   | SELF_ORIGIN        | アプリケーションサーバーオリジン                                               |
|   o   |   o   | CSP_REPORT_URL     | CSPレポート送信先URL                                                           |
|   o   |   o   | DATABASE_HOST      | データベースホスト                                                             |
|   o   |   o   | POSTGRES_PORT      | PostgreSQLポート                                                               |
|   o   |   o   | POSTGRES_USER      | PostgresSQLユーザー                                                            |
|   o   |   o   | POSTGRES_PASSWORD  | PostgreSQLパスワード                                                           |
|   o   |   o   | POSTGRES_DB        | PostgreSQLデータベース名                                                       |
|   o   |   o   | POSTGRES_LOG_LEVEL | PostgreSQLログレベル                                                           |
|   o   |   -   | MIGRATE            | マイグレーション実行有無                                                       |
|   r   |   o   | BETTER_AUTH_SECRET | BetterAuth用シークレット<br>（変更すると既存セッションは無効化される）         |
<!-- TODO -->

## 使い方

### サーバーサイド（ランタイム参照）

loaders/actions/SSR 実行環境でのみ使用可能です。

```ts
const timezone = process.env.TZ;
```

### クライアントサイドおよびサーバーサイド（ビルド時固定）

ビルド時に静的展開（クライアントサイドで直接参照）する場合は、キーにプレフィックス（`VITE_`）を付けてください。

> `VITE_` プレフィックスを付けた環境変数はクライアントに公開されます。  
> 秘密情報（APIキー、シークレット等）には絶対に使用しないでください。

```ts
const apiUrl = import.meta.env.VITE_EX_API_URL;
```
