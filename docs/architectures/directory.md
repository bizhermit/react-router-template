# [アーキテクチャ](./index.md) - ディレクトリ構成

## 全体図

```
src/
├── app/              # ReactRouterアプリケーション
│   ├── layouts/        # レイアウトファイル
│   └── routes/         # ルートファイル
├── features/         # 機能
├── lib/              # 基盤
└── public/           # 静的リソース
```

## クライアントサイド／サーバーサイド

ReactRouterはディレクトリ名またはファイル名に`client`または`server`の単語が含まれている場合、ビルド時に使用可能かどうか検知する機能がある。  

- クライアントサイドのみで使用可能な場合：`**/client/**`ディレクトリを挟むか、`*.client.ts`
- サーバーサイドのみで使用可能な場合：`**/server/**`ディレクトリを挟むか、`*.server.ts`

## ディレクトリ詳細

### src/lib

機能を含んでいない基盤部品（他プロジェクトへの流用が可能かどうかが目安）

```
src/lib/
├── assets/           # アセット
├── client/           # クライアントサイド用
├── components/       # UIコンポーネント
├── server/           # サーバーサイド用
└── shared/           # クライアントサイド／サーバーサイド両対応
```

### src/app/features

機能部品

```
src/features/
├── assets/           # アセット
├── client/           # クライアントサイド用
├── components/       # UIコンポーネント
├── server/           # サーバーサイド用
└── shared/           # クライアントサイド／サーバーサイド両対応
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

単体／結合テストファイル（`*.spec.ts`/`*.test.ts`）はテスト対象が所属するディレクトリ内に`test/`ディレクトリに作成する。

```
src/lib/
├── components/
│   ├── elements/
│   │   ├── button.tsx
│   │   ├── head-line.tsx
│   │   ├── section.tsx
│   │   └── test/
│   │       ├── button.spec.ts
│   │       └── head-line.spec.tsx
...
```
