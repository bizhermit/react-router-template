# 機能仕様

## 画面

- [ルーティング](../../app/routes.ts)  

<details>
<summary>一覧</summary>

| エンドポイント | 画面名           | 備考 |
| -------------- | ---------------- | ---- |
| `/`            | インデックス     |      |
| `/sandbox`     | サンドボックス   |      |
| `/sign-in`     | サインイン画面   |      |
| `/sign-out`    | サインアウト画面 |      |

</details>

## WebAPI

- [ルーティング](../../app/routes.ts)  
- [TSOpenAPI](../../app/api-docs/internal.ts)
- [OpenAPI](../api/internal.yaml)

<details>
<summary>一覧</summary>

| エンドポイント | メソッド | アクション | 名称           | 備考 |
| -------------- | :------: | :--------: | -------------- | ---- |
| `/health`      |    -     |     -      | ヘルスチェック |      |
| `/csp-report`  |  `POST`  |     -      | CSPレポート    |      |
| `/auth/*`      |    -     |     -      | 認証(`auth`)   |      |

</details>


## ストレージ

### Cookie

| キー             | 説明                              | 設定値         | 備考 |
| ---------------- | --------------------------------- | -------------- | ---- |
| `js`             | JavaScript有効フラグ（SSR制御用） | `t`            |      |
| `theme`          | カラーテーマ                      | `light`/`dark` |      |
| `_auth.callback` | 未認証コールバックURL             |                |      |
| `_auth.session`  | セッショントークン                |                |      |
| `_auth.csrf`     | CSRFトークン                      |                |      |

### LocalStorage

| キー | 説明 | 設定値 | 備考 |
| ---- | ---- | ------ | ---- |

### SessionStorege

| キー | 説明 | 設定値 | 備考 |
| ---- | ---- | ------ | ---- |

### ServerSession

| キー                | 説明                           | 設定値                                      | 備考               |
| ------------------- | ------------------------------ | ------------------------------------------- | ------------------ |
| `csrfToken`         | CSRFトークン                   |                                             |                    |
| `csrfTokenWithHash` | CSRFトークン（ハッシュ値付き） |                                             |                    |
| `data`              | サインインユーザーデータ       | [SignInUserData](../../app/auth/types.d.ts) | 未ログイン時`null` |

