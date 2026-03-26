# [アーキテクチャ](./index.md) - コーディング規約

基本ルールは[React](https://ja.react.dev/)および[ReactRouter](https://reactrouter.com/home)の公式に準拠。  
コードフォーマットはESLint（eslint.config.js）の自動整形とする。

## 目的

このドキュメントは、[アプリケーション構成](./app.md)と[ディレクトリ構成](./directory.md)で定義した責務境界・依存方向を、実装時の具体的なコーディングルールに落とし込むことを目的とする。

## 関連ドキュメント

- 責務境界と依存方針は[アプリケーション構成](./app.md)を参照
- 配置先と判断手順は[ディレクトリ構成](./directory.md)を参照
- テストの詳細方針は[テスト方針](./test/index.md)を参照

## レイヤー整合ルール

本規約では、関心の分離を「役割・依存方向・実行環境」の3軸で扱う。

### 1. 役割

画面表示・ユースケース・汎用処理の責務を明確化し、再利用性とテスト容易性を高める  

- 画面遷移・URL・loader/actionに依存する実装は`src/app`に置く
- 機能固有のユースケースは`src/features/<feature-name>`に置く
- 汎用化可能な処理は`src/lib`に置く
- 配置に迷う場合は、まず`src/features/<feature-name>`に置き、複数機能または複数画面での再利用が確認できた時点で`src/lib`へ移す
- ここでいう「汎用化可能」は、将来の見込みではなく、現時点で機能境界をまたぐ再利用要件がある場合を指す

### 2. 依存方向

変更の波及を制御し、循環参照や密結合による保守性低下を防ぐ  

- `app -> features -> lib`および`app -> lib`のみを許可する（MUST）
- `lib -> features`の依存は禁止する（MUST）
- `features`間の依存は同一機能グループ内に限定する（MUST）
- 例外として、共通化対象を`src/lib`へ移行するまでの暫定参照は許可できる（SHOULD: 期限と移行方針をPRに明記）

### 3. 実行環境

ランタイム差異（ブラウザ／サーバー）に起因する不具合やセキュリティリスクを防ぐため  

- `server`専用モジュールを`client`からimportしない（MUST）
- `client`専用モジュールをサーバー処理の中核ロジックに組み込まない（MUST）
- `shared`には環境非依存処理のみを置く（MUST）

## TypeScript

※ Reactコンポーネント（`*.tsx`）含む

### ファイル名

- ケバブケース（`hoge-fuga.tsx`）

### コードフォーマット

- ESLintを使用する（MUST）
- import順・改行スタイルは自動整形（ESLint）の結果に従う（MUST）

### 関数

- `function`を使用する
- 即席関数や変数化したい場合はアロー関数を使用する

### 型

- 外部公開する契約（API入出力、コンポーネントPropsなど）は明示的に型を定義する（MUST）
- `any`の使用は禁止し、必要な場合は`unknown`から絞り込む（MUST）

## Reactコンポーネント

### 粒度

#### Elements

- 基本コンポーネント
- 独立した機能や役割を持つ
- 例：`Button`, `TextBox`, `Dialog`, `Table`（データ型なし）, `NavLayout`

#### Modules

- ある程度の塊となるコンポーネント
- 複数の機能の連携やレイアウトの調整をする
- 例：`Section`, `Table`（データ型あり）

#### Pages

- [ルーティング](../../src/app/routes.ts)に設定するコンポーネント
- `src/app/routes/`フォルダ内に作成する
- エンドポイントに表示される画面単位
- 画面上で保持するデータの管理をする
- ここで管理するデータは、表示制御や入力状態などのUI状態を基本とし、ユースケース本体の状態管理は`src/features`または`src/lib`へ委譲する
- 表示と入出力整形に責務を限定し、ユースケース本体は`src/features`または`src/lib`へ委譲する
- ReactRouterに依存する
  - URL（パスパラメータ、クエリパラメータ）を`props`を通さず直接参照
  - loaderの値を`props`を通さず直接参照
  - Formアクション
- 必要であればModulesやElementsにコンポーネントを切り出す
  - 1ファイルあたりの記述量が増えた場合（500行／3コンポーネント超えあたりが目安）
  - 他コンポーネントでも使いまわす場合
  - 再レンダリング制御が必要な場合

### 基本ルール

#### Propsの定義

- コンポーネントファイル内に記載
- 型定義名は`[コンポーネント名（パスカルケース）] + Props`
- interfaceを使用する
  - UnionやTupleを使用する場合はtypeも可
- ファイル内でのみ使用可能としたい場合は`export`はしない
- 外部公開する契約として再利用する場合のみ`export`してよい
- `Pages`はReactRouterの`Route.ComponentProps`を基本とする（SHOULD）
- フレームワーク制約・型表現上の理由がある場合は、代替型定義を許可する（MUST: 理由をコメントまたはPRで明示）
- 単一用途のProps型は同一ファイル内に閉じる

```tsx
interface HogeFugaProps {
  className?: string;
  initCount?: number;
  children: ReactNode;
}
```

#### コンポーネントの定義

- コンポーネント名はパスカルケース
- `function`を使用する
- `default export`はしない（`Pages`はReactRouterの仕様のため例外）
- コンポーネント内でのみ使用する子コンポーネントは同じファイル内に定義する

```tsx
export function HogeFuga(props: HogeFugaProps) {
  return (
    <section className="bg-white border rounded-md p-4">
      <Divider />
      {props.children}
      <Divider />
    </section>
  );
}

function Divider() {
  return <hr className="bg-red-500" />;
}
```

#### コンポーネント内処理

- 順番は出来る限り以下とする（ただし可読性やまとまりを優先）
  1. 変数定義
  2. 関数定義
  3. 副作用
- コンポーネントの関数内で依存しないものはコンポーネント外に定義する。

```tsx
// HogeFugaのPropsや状態に依存しない関数
function log(...messages: unknown[]) {
  // eslint-disable-next-line no-console
  console.log(messages);
}

export function HogeFuga(props: HogeFugaProps) {
  // 変数
  const [count, setCount] = useState(props.initCount ?? 0);

  // 関数
  function handleClick() {
    log("click", count);
  }

  // 副作用
  useEffect(() => {
    log("count up", count);
  }, [count]);

  return (
    <div className="flex flex-row gap-2">
      <button
        type="button"
        onClick={handleClick}
      >
        count up
      </button>
      <span>{count}</span>
    </div>
  );
}
```

#### アクセシビリティ

- クリック可能な要素は`button`または`a`を基本とし、`div`等にクリックイベントのみを付与しない（MUST）
- フォーム部品は`label`または`aria-label`/`aria-labelledby`で操作対象の名称を提供する（MUST）
- キーボード操作（Tab移動、Enter/Space操作）で到達・実行できる実装にする（MUST）
- 見出し構造（h1-h6）を順序立てて使用し、ランドマーク要素（`main`/`nav`/`header`等）を適切に配置する（SHOULD）
- 状態変化（ローディング、エラー、無効状態）は視覚表現だけでなく属性（`aria-busy`/`aria-invalid`/`disabled`等）でも表現する（SHOULD）

## サーバー実装

- DBアクセス・外部APIアクセスは`server`配下に集約する
- SQL/コマンド/クエリ生成時に文字列連結を使用せず、必ずプレースホルダー・パラメータバインディングを使用する
- エラーおよびログに認証情報・個人情報を出力しない

## CSS

- [TailwindCSS](https://tailwindcss.com/)を使用する
- 使用頻度が高いコンポーネント（ボタン等）や、TailwindCSSでは実装が難しい場合はクラスの定義を検討する
  - 使用頻度が高い共通部品（＝基盤）はcssファイルを作成し、`src/lib/components/global.css`に記述またはインポートする（グローバルスタイル化）
  - エッジケースは[CSS Modules](https://github.com/css-modules/css-modules?tab=readme-ov-file)を使用する
  
### CSSファイル命名規則

- CSSファイルは使用するReactコンポーネントと同階層に作成する
- CSS Modulesの場合、使用するReactコンポーネントと同じ名前とする

### 変数

- TailwindCSSのユーティリティの拡張および、スタイル
- [global.css](../../src/lib/components/global.css)の`@theme`に追加する

### クラス名

ライブラリ等の導入時にクラス名の衝突を避けるため、独自クラスは`_`から始める

### レイヤー

#### 通常（グローバルスタイル）

`@layer`で`base`または`components`を使用する

- `base`：タグまたは`components`で上書きを考慮すべきプロパティを持つクラス名を指定
- `components`：クラス名指定

```css
@layer base {
  
  html {
    font-size: 62.5%;
    width: 100%;
    height: 100%;
  }

  body {
    font-size: 1.6rem;
    width: 100%;
    min-height: 100%;
  }

  ::placeholder {
    color: var(--color-placeholder);
  }

}

@layer components {

  ._icon {
    width: 1.6rem;
    fill: currentColor;
    stroke: currentColor;
    stroke-width: 0;
    stroke-linecap: round;
  }

}
```

#### CSS Modules

`@layer`は使用しない

## テスト

- 単体・結合・E2Eの詳細な指示は[テスト方針](./test/index.md)を参照する
- テスト駆動開発（TDD）は必須ではない
- ただし、実装変更時は変更対象の振る舞いを検証するテストの追加または更新を必須とする
- 単体テストを基本とし、1テストケースは1つの振る舞いを検証する
- 重要な分岐・エッジケースは必ずテストする
- テストファイルは対象ディレクトリ配下の`_tests/`へ配置する

## 実装前チェックリスト

- 依存方向が`app -> features -> lib`または`app -> lib`を満たしている
- `lib -> features`の逆依存がない
- `server`/`client`/`shared`の境界を越えるimportがない
- import順・改行スタイルが自動整形結果と一致している
- `any`を使用せず、必要箇所で型を明示している
- `Pages`の型定義が方針に一致し、例外時の理由が明記されている
- UIコンポーネントがキーボード操作とラベル付けを満たし、必要なARIA属性で状態を表現している
- テストが`_tests/`配下に配置され、対象の振る舞いを検証している
