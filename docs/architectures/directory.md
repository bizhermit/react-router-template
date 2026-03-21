# [アーキテクチャ](./index.md) - ディレクトリ構成

## 目的

このドキュメントは、実装時に「どこへ何を置くか」を一貫して判断できるようにするための配置ルールを定義する。

## 関連ドキュメント

- 責務境界と依存方向の背景は[アプリケーション構成](./app.md)を参照
- 依存方向の基準は[依存ルール](./app.md#依存ルール)
- 全体の責務分割は[レイヤー構成](./app.md#レイヤー構成)

## このドキュメントの使い方

1. まず「配置ルール」で責務と依存方向を確認する
2. 次に「全体図」で対象ディレクトリの位置を把握する
3. 最後に「ディレクトリ詳細」で具体的な配置先を決める

## 配置ルール

- 画面ルーティングとページ責務は`src/app`に置く
- 機能固有のユースケースは`src/features/<feature-name>`に閉じる
- 汎用化可能な部品は`src/lib`へ寄せる
- 依存方向は`app -> features -> lib`および`app -> lib`を維持する
- `lib -> features`の逆依存は禁止する
- 実行環境の境界は`client`/`server`/`shared`で明示する

この配置ルールは[アプリケーション構成](./app.md#依存ルール)の依存方針と一致させる。

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
- 環境非依存で利用する場合：`shared`へ配置する

## 追加時の判断フロー

1. その実装は画面遷移・URL・loader/actionに依存するか
2. Yesの場合は`src/app`、Noの場合は次へ
3. その実装は特定機能（例: 認証）に閉じるか
4. Yesの場合は`src/features/<feature-name>`、Noの場合は`src/lib`
5. 実行環境に応じて`client`/`server`/`shared`を選ぶ

この判断は[機能境界](./app.md#機能境界)に沿って行う。

## ディレクトリ詳細

### src/lib（基盤部品）

アプリ非依存・状態を持たない部品のみ（他プロジェクトへの流用が可能かどうかが目安）。  
依存関係は`src/lib`内で完結させる。  

主な責務:

- UI部品（elements/modules）
- 汎用ユーティリティ
- 共通I/Oスキーマ
- 環境共通処理（i18n、fetch、providerなど）

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

主な責務:

- 機能固有のドメインロジック
- 機能固有の認証・認可要件
- 機能固有の外部API連携
- 機能固有の状態管理

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
├── shared/
│   ├── objects/
│   │   ├── data.ts
│   │   ├── date.ts
│   │   ├── string.ts
│   │   └── _tests/
│   │       ├── data.spec.ts
│   │       └── date.spec.tsx
...
```

## 運用上の注意

- 新規追加時は、先に[アプリケーション構成](./app.md)で責務境界を確認する
- 実装後は、配置先が依存ルールに反していないかをレビュー項目に含める
- 機能追加で共通化が必要になった場合のみ、`features`から`lib`へ段階的に移動する

配置変更が発生した場合は、必要に応じて[アプリケーション構成](./app.md)の責務記述も同時に更新する。
