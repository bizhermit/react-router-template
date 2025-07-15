# コーディング規約

基本ルールは[React](https://ja.react.dev/)および[ReactRouter](https://reactrouter.com/home)の公式に準拠。  
コードフォーマットはESLint（eslint.config.js）の自動整形とする。

## フォルダ構成

| フォルダ          | 説明                               |
| ----------------- | ---------------------------------- |
| `app/components/` | 機能要件を含まないコンポーネント群 |
| `app/features/`   | 機能要件を含むコンポーネント群     |
| `app/routes/`     | ルーティングファイル               |
| `app/i18n/`       | 国際化モジュール                   |
| `public/imgs/`    | 画像ファイル                       |
| `public/locales/` | 言語設定ファイル                   |
| `prisma/`         | Prisma定義ファイル                 |
| `docs/`           | ドキュメント                       |

## ページ

`app/routes/`にエントリーファイルを作成し、`app/routes.ts`にてルート設定する。  

エントリーファイルを作成する場所はURLパス準拠としつつ、機能グループでまとまるようにする。  

例：
- `/login`：`/app/routes/login/page.tsx`
- `/home`：`/app/routes/home/page.tsx`
- `/feature`：`/app/routes/feature/list-page.tsx`
- `/feature/[id]`：`/app/routes/feature/detail-page.tsx`

### 機能実装

- 機能を含まないものはできるだけ`src/components/`へ分離し、機能実装ファイルが簡潔になるように心がける
- 機能実装はパスルートの型情報（`Route`）を活かし、かつファイルが乱立することを防ぐためにエントリーファイルに記述する
- エントリーファイルの記述量が多くなる場合は、機能グループ内であれば機能グループフォルダ内にファイルを作成する
- 機能グループをまたいだコンポーネントの場合は、`src/features/`にファイルを作成する。

## スタイリング

- [TailwindCSS](https://tailwindcss.com/)を使用する
- 使用頻度が高いコンポーネント（ボタン等）や、TailwindCSSでは実装が難しい場合はクラスの定義を検討する
