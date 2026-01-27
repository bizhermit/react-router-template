# [アーキテクチャ](./index.md) - ディレクトリ構成

## 全体図

```
.
├── docs/                    # ドキュメント
│   ├── api/                   # OpenAPI
│   ├── architectures/         # アーキテクチャ仕様
│   ├── features/              # 機能仕様
│   └── git/                   # Git運用
├── drizzle/                 # Drizzleマイグレーションファイル
├── public/                  # 静的リソース
├── playwright/              # Playwright設定／シナリオ
├── scripts/                 # 開発用スクリプト
├── src/                     # ソースコード
│   ├── app/                   # ReactRouterアプリケーション
│   │   ├── layouts/             # レイアウトファイル
│   │   ├── routes/              # ルートファイル
│   │   ├── entry.client.ts      # エントリー（クライアント）
│   │   ├── entry.server.ts      # エントリー（サーバー）
│   │   ├── root.ts              # ルート（html）
│   │   └── routes.ts            # ルーティング設定
│   ├── features/              # 機能
│   └── lib/                   # 基盤
```

## クライアントサイド／サーバーサイド

ReactRouterはディレクトリ名またはファイル名に`client`または`server`の単語が含まれている場合、ビルド時に使用可能かどうか検知する機能がある。  

- クライアントサイドのみで使用可能な場合：`**/client/**`ディレクトリを挟むか、`*.client.ts`
- サーバーサイドのみで使用可能な場合：`**/server/**`ディレクトリを挟むか、`*.server.ts`

## ディレクトリ詳細

### src/lib（基盤部品）

アプリ非依存・状態を持たない部品のみ（他プロジェクトへの流用が可能かどうかが目安）。  
依存関係は`src/lib`内で完結させる。  

```
src/lib/
├── assets/        # アセット
│   └── images/      # 画像（import用）
├── client/        # クライアントサイド用
│   ├── dom/         # dom操作
│   ├── i18n/        # i18n
│   ...
├── components/    # UIコンポーネント
│   ├── elements/    # 要素
│   ├── modules/     # モジュール
│   ...
├── server/        # サーバーサイド用
│   ├── database/    # データベース
│   ├── http/        # http
│   ├── i18n/        # i18n
│   ...
└── shared/        # クライアントサイド／サーバーサイド両対応
    ├── api-docs/    # api-doc
    ├── fetch/       # fetch
    ├── hooks/       # react-hook
    ├── i18n/        # i18n
    ├── objects/     # 基本オブジェクト
    ├── providers/   # react-provider
    ├── schema/      # オブジェクトスキーマ
    ├── timing/      # 時間制御
    ...
```

### src/features（機能部品）

ユースケース・状態・APIに依存の部品。  
依存関係は`src/lib`、および`src/features`の同グループ内で完結させる。  
機能グループ内の構成（client/server/shared他）は基盤部品と同様。

```
src/features/
├── auth/             # 認証機能グループ
│   ├── assets/         # アセット
│   ├── client/         # クライアントサイド用
│   ├── components/     # UIコンポーネント
│   ├── server/         # サーバーサイド用
│   └── shared/         # クライアントサイド／サーバーサイド両対応
├── user/             # ユーザー機能グループ
│   ├── assets/         # アセット
│   ├── client/         # クライアントサイド用
│   ├── components/     # UIコンポーネント
│   ├── server/         # サーバーサイド用
│   └── shared/         # クライアントサイド／サーバーサイド両対応
...           
```

### public

静的リソース

```
public/
├── images/      # 画像ファイル
├── js/          # 外部JavaScriptファイル
└── locales/     # 言語ファイル
```

## テストディレクトリ

単体／結合テストファイル（`*.spec.ts`/`*.test.ts`）はテスト対象が所属するディレクトリ内に`_tests/`ディレクトリに作成する。

```
src/lib/
├── components/
│   ├── elements/
│   │   ├── button.tsx
│   │   ├── head-line.tsx
│   │   ├── section.tsx
│   │   └── _tests/
│   │       ├── button.spec.ts
│   │       └── head-line.spec.tsx
...
```
