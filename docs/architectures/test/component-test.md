# コンポーネントテスト仕様

UI コンポーネントをブラウザに近い環境で結合し、UI イベント/状態遷移を検証するための指示書。ユニットテストとの違いは DOM を介した相互作用が対象になる点であり、エンドツーエンド全体は扱わない。全体構成は [docs/architectures/test/index.md](./index.md) を参照。

> **CI 実行**: コンポーネントテストはユニット/インテグレーションと同じく `npm run test`（Vitest）で実行される。DOM 環境を必要とする場合は `npx vitest --run --dom` をローカルで利用する。

> **運用優先度**: 本書は人間レビューにも対応するが、AI エージェントによる自動実行手順を優先する。AI は本書の「AI エージェント手順」と「実行結果レポート（必須フォーマット）」を満たすこと。

## クイックスタート

1. **対象範囲を決める** — コンポーネントの入出力（props・コンテキスト・外部依存）を一覧化する。
2. **レンダラを準備** — React Testing Library + JSDOM を基本とし、必要な Provider を最小構成でラップする。
3. **ケース設計** — UI 状態（初期/操作後/エラー表示など）と操作シーケンスを表で整理する。
4. **ユーザー操作を再現** — `userEvent` でクリック/入力/フォーカスなどを実行し、DOM の変化を検証する。
5. **アクセシビリティ/セキュリティ確認** — ロール/ARIA/ラベル・セキュアな属性（`rel="noopener"` など）を併せてチェックする。

> **Checklist**
> - [ ] 表示状態のパターン（空/単一/複数/エラー）がすべてテストカバーされている
> - [ ] ロール/ラベルで要素参照し、実装詳細（class/構造）には依存していない
> - [ ] イベント順序や非同期ハンドラは `await` を使って安定化している
> - [ ] スナップショットは最小限にし、意味のある DOM 断言を優先している
> - [ ] Provider や Context のモックが肥大化していない

## 基本方針

- **ユーザー視点の検証**: `screen.getByRole` / `findByText` などアクセシビリティ API を優先する。
- **最小ラッパー**: Theme/Router/Store など必要な Provider だけをテスト専用ラッパーで包み、過剰な依存を避ける。
- **副作用の検証**: イベント発火・API 呼び出し（スタブ）・ストア更新などもアサートする。
- **視覚より意味**: CSS 依存のアサーションは避け、表示テキストや aria 属性など意味情報を確認する。

## 対象としないもの

- サーバー/DB を伴う統合挙動（[インテグレーションテスト](./integration-test.md) 参照）。
- ブラウザ/端末差異、ルーティング全体、バックエンド接続まで含むフロー（E2E テストで扱う）。
- デザイナーによるピクセルパーフェクト検証（Storybook + Visual regression に委譲）。

## テストベッド

| 項目     | 推奨アプローチ                                                       |
| -------- | -------------------------------------------------------------------- |
| レンダラ | React Testing Library (`render`, `screen`)                           |
| UI 操作  | `@testing-library/user-event` を使用し、`await` で確実に反映待ちする |
| Mocks    | `vi.fn` や MSW を併用し、API 依存は HTTP 層でスタブする              |
| Provider | 独自の `TestWrapper` を作り、Router/Theme/i18n を注入する            |
| 最適化   | `cleanup()` を `afterEach` で実行し、dom 汚染を防止する              |

## データと状態

- コンポーネントに渡す props は `test.each` や builder 関数で生成し、各ケースの意図をコメントで明示する。
- グローバルストア（例: Zustand, Redux）はテスト用の in-memory store に差し替え、テスト終了時にリセットする。
- 国際化やフォーマットは locale を固定（例: `i18n.changeLanguage("ja")`）し、期待表示を揺らぎなく比較する。

## ターゲット別ベストプラクティス

### フォームコンポーネント

- ラベルやプレースホルダーで要素を取得し、バリデーションエラーの表示を `findByText` で確認する。
- 非同期送信は `await user.click` → `await screen.findByRole("status")` などで待機し、スピナー/エラーを検証する。

### リスト表示 / テーブル

- 空状態/単一行/複数行/ページネーションをカバーし、`within` で部分的に DOM を絞り込む。
- 並び替えやフィルタ操作を `userEvent` で実行し、ソート順やクエリ更新をアサートする。

### モーダル / ダイアログ

- Portal を使う場合は `document.body` を直接検証し、フォーカストラップが機能しているかをチェックする。
- ESC キーで閉じる、背景クリックで閉じるなどアクセシビリティ要求を忘れずにテストする。

## 観測ポイント

- `console.error` / `console.warn` をスパイし、テスト実行中に React の警告が出ていないか確認する。
- `axe-core` などのアクセシビリティ検査ツールをオプションで実行し、重大な違反がないかチェックする。

## ケーススタディ: SubmitButton コンポーネント

- 対象: [src/lib/components/SubmitButton.tsx](../../src/lib/components/SubmitButton.tsx)（想定）
- テスト配置案: [src/lib/components/_tests/SubmitButton.component.test.tsx](../../src/lib/components/_tests/SubmitButton.component.test.tsx)

> **注記**: 上記は実装イメージのための参考例。実在しない場合は新規作成を前提にせず、既存コンポーネントを対象に同等の観点でテストを作成する。

| シナリオ         | 前提/操作                                   | 期待する結果                                           |
| ---------------- | ------------------------------------------- | ------------------------------------------------------ |
| 有効状態クリック | `disabled=false` でレンダリングし、クリック | `onSubmit` が 1 回呼ばれ、ボタンがフォーカスを保持     |
| 無効状態         | `disabled=true` でレンダリング              | `onSubmit` が呼ばれず、ボタンが `aria-disabled` を持つ |
| ローディング表示 | `loading=true` の props                     | スピナーが表示され、`aria-busy=true` になる            |

### 推奨テスト実装スケッチ

```ts
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SubmitButton from "../SubmitButton";

describe("SubmitButton (component)", () => {
  it("有効状態でクリックすると onSubmit を呼ぶ", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<SubmitButton label="送信" disabled={false} onSubmit={onSubmit} />);

    await user.click(screen.getByRole("button", { name: "送信" }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
```

### セキュリティ/非機能チェック

- イベントハンドラで `target` に依存している場合、`userEvent` で実際の DOM イベントを通すことで検証する。
- `rel="noopener"` や `target="_blank"` を持つリンクは安全な属性セットになっているか確認する。
- レンダリング性能が気になるコンポーネントは `performance.mark` などで基準を取り、遅延が発生していないか監視する。

## AI エージェント手順

1. 対象コンポーネントと依存 Provider を洗い出し、テスト用ラッパーを作成する。
2. 状態遷移や表示パターンを `test.each` で列挙し、ユーザー操作を `userEvent` で再現する。
3. DOM 断言はロール/テキスト/ARIA 属性を優先し、実装詳細への依存を避ける。
4. React の警告や非同期警告が出ていないか `console.error` / `console.warn` を監視し、テスト間の状態汚染がないようモックを復元する。
5. セキュリティ/アクセシビリティ観点をセルフチェックし、必要なテストを追加する。
6. 変更範囲に応じて対象テストを実行し、失敗時は原因を分類（テスト不備/実装修正必要/環境要因）して再実行する。
7. 下記「実行結果レポート（必須フォーマット）」を埋めて提出する。

### 完了条件（AI 自動実行）

- 対象コンポーネントの主要状態（初期/操作後/異常）がテストでカバーされている。
- 追加したテストがロール/ラベル/ARIA の少なくとも 1 つを利用している。
- 対象テスト実行結果が取得され、失敗ケースには対応方針が記載されている。
- 実行結果レポートの必須項目がすべて埋まっている。

### 実行結果レポート（必須フォーマット）

AI エージェントは作業完了時に、以下の 4 項目を必ず出力すること。

```md
## 追加テスト一覧
- [テストファイルパス]: [追加/更新したテスト名] - [目的]

## 未実施リスク
- [未実施項目]: [未実施理由] / [想定影響]

## 残リスク
- [残存する懸念]: [発生条件] / [暫定対策または今後の対応]

## テスト結果
- 実行コマンド: [command]
- 結果: [pass/fail]
- 補足: [失敗時の要約、再実行有無、次アクション]
```

## 参考

- テスト全体構成: [docs/architectures/test/index.md](./index.md)
- ユニットテスト方針: [docs/architectures/test/unit-test.md](./unit-test.md)
- アクセシビリティ基準: [docs/architectures/security-checklist.md](../security-checklist.md)
