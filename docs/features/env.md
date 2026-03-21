# 環境変数

このプロジェクトでは、環境変数の設定元を`./docker/.env`に統一します。  
`./docker/.env.example`を参考に、`./docker/.env`を作成してください。

## 運用ルール

- 環境変数ファイルは`./docker/.env`のみを使用する
- `vite`標準の`.env.*`（例: `.env.local`, `.env.development`）は使用しない
- 開発コンテナ起動時は`./docker/.env`ファイルが必須（中身が空でも可）

## 初期セットアップ

PowerShell:

```powershell
Copy-Item ./docker/.env.example ./docker/.env
```

bash:

```bash
cp ./docker/.env.example ./docker/.env
```

## 設定値

- `r`: 必須
- `o`: 任意
- `-`: 未使用

| 本番  | 開発  | キー                 | 既定値                            | 説明                                                                |
| :---: | :---: | -------------------- | --------------------------------- | ------------------------------------------------------------------- |
|   -   |   o   | HOST_UID             | `1000`                            | UID（Linux系ホスト利用時に設定）                                    |
|   -   |   o   | HOST_GID             | `1000`                            | GID（Linux系ホスト利用時に設定）                                    |
|   -   |   o   | COMPOSE_PROJECT_NAME | -                                 | Docker Composeのプロジェクト名                                      |
|   o   |   o   | TZ                   | `UTC`                             | タイムゾーン（例: `Asia/Tokyo`）                                    |
|   -   |   o   | LOCALHOST            | -                                 | ホスト名の上書き用（通常は未使用）                                  |
|   o   |   o   | PORT                 | `3000`                            | アプリケーションサーバー起動ポート                                  |
|   -   |   o   | DEV_PORT             | `5173`                            | 開発サーバー起動ポート                                              |
|   o   |   o   | SELF_ORIGIN          | -                                 | アプリケーションサーバーのオリジン（例: `http://localhost:3000`）   |
|   o   |   o   | CSP_REPORT_URL       | -                                 | CSPレポート送信先URL（例: `http://localhost:3000/csp-report/`）     |
|   o   |   o   | DATABASE_HOST        | `postgres`                        | データベースホスト名                                                |
|   o   |   o   | POSTGRES_PORT        | `5432`                            | PostgreSQLポート                                                    |
|   o   |   o   | POSTGRES_USER        | `postgres`                        | PostgreSQLユーザー                                                  |
|   o   |   o   | POSTGRES_PASSWORD    | `password`                        | PostgreSQLパスワード                                                |
|   o   |   o   | POSTGRES_DB          | `template`                        | PostgreSQLデータベース名                                            |
|   o   |   o   | POSTGRES_LOG_LEVEL   | `WARNING`（dev）/ `FATAL`（prod） | PostgreSQLログレベル                                                |
|   o   |   -   | MIGRATE              | `true`                            | 起動時マイグレーション実行有無（本番コンテナ起動時）                |
|   r   |   o   | BETTER_AUTH_SECRET   | -                                 | Better Auth用シークレット（変更すると既存セッションは無効化される） |

## セキュリティ注意事項

- `BETTER_AUTH_SECRET`やDB認証情報は機密情報として扱い、リポジトリへコミットしない
- エラーログ出力時に秘密情報をそのまま出力しない
- 本番環境では推測困難なランダム文字列を設定する

## 使い方

### サーバーサイド（ランタイム参照）

Node.js実行環境（loader/action、サーバーサイド処理）で`process.env`から参照します。

```ts
const timezone = process.env.TZ;
```

### クライアントサイドおよびサーバーサイド（ビルド時固定）

`import.meta.env`はビルド時に静的展開されます。  
クライアントから参照するカスタム環境変数は`VITE_`プレフィックス付きで定義してください。

> `VITE_` プレフィックスを付けた環境変数はクライアントに公開されます。  
> 秘密情報（APIキー、シークレット等）には絶対に使用しないでください。

```ts
const apiUrl = import.meta.env.VITE_EX_API_URL;
```

> このプロジェクトでは`.env.*`を使用しないため、`VITE_`変数を使う場合も`./docker/.env`で管理します。
