# 機能仕様

## 画面

- [ルーティング](/src/app/routes.ts)  

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

- [ルーティング](/src/app/routes.ts)  
- [TSOpenAPI](/docs/api/internal.ts)
- [OpenAPI](/docs/api/internal.yaml)

<details>
<summary>一覧</summary>

| エンドポイント | メソッド | アクション | 名称           | 備考 |
| -------------- | :------: | :--------: | -------------- | ---- |
| `/health`      |    -     |     -      | ヘルスチェック |      |
| `/csp-report`  |  `POST`  |     -      | CSPレポート    |      |

</details>


## ストレージ

### Cookie

| キー    | 説明                              | 設定値         | 備考 |
| ------- | --------------------------------- | -------------- | ---- |
| `js`    | JavaScript有効フラグ（SSR制御用） | `t`            |      |
| `theme` | カラーテーマ                      | `light`/`dark` |      |

### LocalStorage

| キー | 説明 | 設定値 | 備考 |
| ---- | ---- | ------ | ---- |

### SessionStorege

| キー | 説明 | 設定値 | 備考 |
| ---- | ---- | ------ | ---- |

