# [アーキテクチャ](./index.md) - ディレクトリ構成

## 全体図

```
src/
├── app/              # ReactRouterアプリケーション
│   ├── api-docs/       # APIDoc
│   ├── auth/           # 認証
│   ├── components/     # 共通
│   ├── features/       # 機能
│   └── i18n/           # 国際化対応
├── playwright/       # Playwright
├── prisma/           # Prisma
└── public/           # 静的リソース
```

## クライアントサイド／サーバーサイド

ReactRouterはディレクトリ名またはファイル名に`client`または`server`の単語が含まれている場合、ビルド時に使用可能かどうか検知する機能がある。  

- クライアントサイドのみで使用可能な場合：`**/client/**`ディレクトリを挟むか、`*.client.ts`
- サーバーサイドのみで使用可能な場合：`**/server/**`ディレクトリを挟むか、`*.server.ts`

## ディレクトリ詳細

### src/app/components

機能を含んでいない共通部品（他プロジェクトへの流用が可能かどうかが目安）

```
src/app/components/
├── assets/           # アセット 
│   └── images/         # 画像ファイル
├── client/           # クライアントサイド専用
│   └── dom/            # DOM操作
├── cookie/           # Cookie
├── fetch/            # fetch
├── objects/          # オブジェクト
├── react/            # React
│   ├── elements/       # 要素
│   ├── hooks/          # Hook
│   └── providers/      # Provider
├── schema/           # スキーマ
├── security/         # セキュリティ
├── server/           # サーバーサイド専用
└── utilities/        # ユーティリティー
```

### src/app/features

機能部品

```
src/app/features/
├── common/               # 共通 
│   ├── assets/             # アセット 
│   │   └── images/           # 画像ファイル
│   ├── server/             # サーバーサイド（WebAPI）
│   ├── react/              # React 
│   │   ├── elements/         # 要素
│   │   ├── hooks/            # Hook
│   │   └── providers/        # Provider
│   ├── schemas/            # スキーマ 
│   └── services/           # ロジック
├── user/                 # ユーザー機能
│   ├── assets/             # アセット 
│   │   └── images/           # 画像ファイル
│   ├── server/             # サーバーサイド（WebAPI）
│   ├── react/              # React 
│   │   ├── elements/         # 要素
│   │   ├── modules/          # モジュール
│   │   ├── pages/            # ページ
│   │   ├── hooks/            # Hook
│   │   └── providers/        # Provider
│   ├── schemas/            # スキーマ 
│   └── services/           # ロジック
...
```

### public

静的リソース

```
public/
├── images/      # 画像ファイル
├── js/          # JavaScriptファイル
└── locales/     # 言語ファイル
```

## テストディレクトリ

単体／結合テストファイル（`*.spec.ts`/`*.test.ts`）はテスト対象が所属するディレクトリ内に`test/`ディレクトリに作成する。

```
src/app/features/
├── common/
│   ├── react/
│   │   ├── elements/
│   │   │   ├── button.tsx
│   │   │   ├── head-line.tsx
│   │   │   ├── section.tsx
│   │   │   └── test/
│   │   │       ├── button.spec.ts
│   │   │       └── head-line.spec.tsx
...
```
