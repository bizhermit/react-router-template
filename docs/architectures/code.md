# [アーキテクチャ](./index.md) - コーディング規約

基本ルールは[React](https://ja.react.dev/)および[ReactRouter](https://reactrouter.com/home)の公式に準拠。  
コードフォーマットはESLint（eslint.config.js）の自動整形とする。

## TypeScript

※ Reactコンポーネント（`*.tsx`）含む

### ファイル名

- ケバブケース（`hoge-fuga.tsx`）

### コードフォーマット

- ESLintを使用する

### 関数

- `function`を使用する
- 即席関数や変数化したい場合はアロー関数を使用する

## Reactコンポーネント

### 粒度

#### Elements

- 基本コンポーネント
- 独立した機能や役割を持つ
- 例：`Button`, `TextBox`, `Dialog`, `Table`（データ型なし）, `NavLayout`

#### Modules

- ある程度の塊となるコンポーネント
- 複数の機能の連携やレイアウトの調整をする
- 例：`Section`, `Form`（スキーマあり）, `Table`（データ型あり）

#### Pages

- [ルーティング](../../app/routes.ts)に設定するコンポーネント
- エンドポイントに表示される画面単位
- 画面上で保持するデータの管理をする
- 必要であればModulesやElementsにコンポーネントを切り出す
  - 1ファイルあたりの記述量が増えた場合（500行／3コンポーネント超えあたりが目安）
  - 他コンポーネントでも使用する場合

### 基本ルール

#### Propsの定義

- コンポーネントファイル内に記載
- 型定義名は`[コンポーネント名（パスカルケース）] + Props`
- interfaceを使用する
  - UnionやTupleを使用する場合はtypeも可
- ファイル内でのみ使用可能としたい場合は`export`はしない
- `Pages`はReactRouterの`Route.ComponentProps`を使用する

```tsx
export interface HogeFugaProps {
  className?: string;
  initCount?: number;
  children: ReactNode;
};
```

#### コンポーネントの定義

- コンポーネント名はパスカルケース
- `function`を使用する
- `default export`はしない（`Pages`を除く）
- コンポーネント内でのみ使用する子コンポーネントは同じファイル内に定義する

```tsx
export function HogeFuga(props: HogeFuga) {
  return (
    <section class="bg-white border rounded-md p-4">
      <Divider />
      {props.children}
      <Divider />
    </section>
  );
};

function Divider() {
  return <hr className="bg-red-500" />;
};
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
};

export function HogeFuga(props: HogeFuga) {
  // 変数
  const [count, setCount] = useState(props.initCount ?? 0);

　// 関数
  function handleClick() {
    log("click", count);
  };

  // 副作用
  useEffect(() => {
    log("count up", count);
  }, [count]);

  return (
    <div class="flex flex-row gap-2">
      <button
        type="button"
        onClick={handleClick}
      >
        count up
      </button>
      <span>{count}</span>
    </div>
  );
};
```

## CSS

- [TailwindCSS](https://tailwindcss.com/)を使用する
- 使用頻度が高いコンポーネント（ボタン等）や、TailwindCSSでは実装が難しい場合はクラスの定義を検討する
  - 使用頻度が高い共通部品はcssファイルを作成し、`app/global.css`に記述またはインポートする（グローバルスタイル化）
  - エッジケースは[CSS Modules](https://github.com/css-modules/css-modules?tab=readme-ov-file)を使用する
  
### CSSファイル命名規則

- CSSファイルは使用するReactコンポーネントと同階層に作成する
- CSS Modulesの場合、使用するReactコンポーネントと同じ名前とする

### 変数

- TailwindCSSのユーティリティの拡張および、スタイル
- [global.css](../../app/global.css)の`@theme`に追加する

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


