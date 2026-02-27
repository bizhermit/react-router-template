# ユニットテスト仕様

AI エージェントがテストを実装する前提で、人間がレビューしやすい形のユニットテスト規約をまとめる。本書は以下の順で参照することを推奨する。

1. **クイックスタート**: 最小手順とチェック項目で方向性を把握する。
2. **共通ルール**: モックや非決定性排除などの基礎を確認する。
3. **ターゲット別ガイド**: UI / Hooks など対象ごとの注意点を確認する。
4. **ケーススタディ**: 代表モジュールで完成形のイメージを掴む。

> **Scope**: 本ドキュメントはユニットテストのみを対象とする。結合/コンポーネント/E2E テストは [docs/architectures/test/index.md](./index.md) で案内する別ドキュメントにて扱う。

> **CI 実行**: `npm run test`（Vitest）がユニットテストの標準コマンド。CI では `npm run test` が自動で実行されるため、失敗時は本ドキュメントの手順に従って修正する。

## クイックスタート

- **Step1: 対象と責務を確認** — 公開インターフェースと副作用を列挙する。
- **Step2: テスト設計** — 下記チェックリストを使い正常/異常/副作用/境界ケースを決める。
- **Step3: テスト骨子作成** — Arrange/Act/Assert をコメントで先に書き、実装を流し込む。
- **Step4: 非決定要素を排除** — 日時・乱数・ネットワーク・グローバル状態をモックする。
- **Step5: レビュー** — テスト名・可読性・冗長モック・セキュリティ観点をセルフチェックする。

> **Checklist**
> - [ ] 各テストが 1 振る舞いを検証している
> - [ ] フォルダ/ファイル命名が規約に沿っている
> - [ ] 非決定要素は全て制御している
> - [ ] 良い/悪い例で NG としたアンチパターンを含んでいない
> - [ ] ケーススタディに近い粒度まで落とし込めている

## 基本方針

- 振る舞いを検証する: 内部実装ではなく公開インターフェースの入出力を確認する。
- シンプルかつ局所的: 1 テストケース = 1 振る舞い。副作用や環境依存を最小化する。
- 再現性確保: 時刻・乱数・ネットワーク・ファイルシステムなど非決定要素は必ずモックする。
- 可読性優先: Arrange / Act / Assert を明示し、テスト名で意図を伝える。
- 最小限の準備: フィクスチャやヘルパーは重複排除のために小さく保ち、過度な抽象化は避ける。

## 対象としないもの

- 外部サービスとの統合挙動（モックで代替する）。必要に応じて結合テストドキュメントへ委譲する。
- DB など永続層への実書き込み（必要ならインメモリ/モックを使用）。実 DB を用いる検証は結合テスト章で扱う。
- UI スナップショットの安易な量産（意味のある差分のみ）。外観保証が必要な場合はコンポーネントテスト/E2E へ回す。

## ディレクトリと命名

- テストファイルは「対象ファイル 1 つにつき 1 ファイル」を原則とし、対象と同階層に `_tests` ディレクトリを作成して配置する（既存方針に従う）。
- ファイル名: `<対象ファイル名>.test.ts(x)` を基本とする。
- `describe` は機能やメソッド単位、`it/test` は期待する振る舞いを自然文で書く。

## テストの構成例

```ts
describe('FeatureX', () => {
	it('期待する振る舞いを説明する', () => {
		// Arrange: 入力と依存を用意
		// Act: 対象を実行
		// Assert: 出力や副作用を検証
	});
});
```

- 必要な場合のみ日本語コメントで意図を補足する。自明なコメントは書かない。

## モック/スタブの指針

- 副作用を持つ依存（HTTP/DB/FS/日時/乱数/環境変数）は必ずモックする。
- モックはテスト内で完結させ、`beforeEach` でリセットする。
- 実装詳細に強く依存するモックは避け、公開 API を通じて設定する。

## データ・フィクスチャ

- 最小限の入力データで期待値を明確化する。複雑な JSON はビルダー関数やヘルパーで生成し、意図をコメントする。
- 同一データを複数テストで使う場合のみ共有フィクスチャを導入する。

## アサーション

- 期待する振る舞いを 1 テスト 1 断言で表現するのが基本。必要に応じて関連する複数アサーションをまとめてもよいが、目的がぶれないようにする。
- エラー発生パスは `throws` を明示的に検証する。

## 非決定性の排除

- 日時: 固定値を注入するか、`vi.setSystemTime` などで固定する。
- 乱数: シード固定、または乱数生成器を依存注入してモックする。
- タイマー: フェイクタイマーを利用し、`advanceTimersByTime` で制御する。

## テストケースの洗い出しチェックリスト

- 正常系: 代表値と境界値（最小/最大/空/null/undefined）。
- 異常系: 例外/バリデーション/権限不足/依存エラー。
- 副作用: ストア更新・イベント発火・ログ出力（センシティブ情報が漏れないか）。
- パフォーマンス: 重いループや大規模入力は単体では避け、別途ベンチや統合テストで扱う。

## 網羅的なテストパターン作成ガイド

- 入力を同値類分割し、各クラスから代表値を 1 つ以上選ぶ。
- 連続値・サイズ系は境界値（直前/直後/最小/最大/空）を必ず含める。
- エラーパスは原因別に分解（バリデーション、依存失敗、権限、タイムアウト等）し、それぞれ 1 ケース以上用意する。
- 副作用を持つ処理は「副作用が起きる」「起きない」の両方を検証する。
- 多数のパラメータ組み合わせは直交表レベルに簡約し、重要組み合わせだけを残す（全探索はしない）。
- 状態遷移を持つ場合は、代表的な遷移パス（正常シナリオ + 失敗後リトライなど）を最小本数でカバーする。

## ターゲット別ベストプラクティス

### UI コンポーネント

- React Testing Library を利用し、DOM 実装詳細ではなくユーザー視点（ロール・テキスト）で検証する。
- レンダリング結果はスナップショット頼みではなく、`screen.getByRole` などで意味のある要素を断言する。
- 状態遷移（クリック/入力/フォーカス）を `userEvent` で操作し、イベント順序が崩れないように `await` を徹底する。
- Context や Provider が必要な場合は最小限のテスト専用ラッパーを用意し、過剰なモックを避ける。
- レスポンシブやテーマ差分は、Variant 1 つをベースにしつつ主要ブレークポイントのみ追加で検証する。

#### 良い例

```ts
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SubmitButton from '../SubmitButton';

describe('SubmitButton', () => {
	it('有効状態でクリックすると onSubmit を呼ぶ', async () => {
		const onSubmit = vi.fn();
		const user = userEvent.setup();
		render(<SubmitButton label="送信" disabled={false} onSubmit={onSubmit} />);

		await user.click(screen.getByRole('button', { name: '送信' }));

		expect(onSubmit).toHaveBeenCalledTimes(1);
	});
});
```

#### 悪い例

```ts
import { render } from '@testing-library/react';
import SubmitButton from '../SubmitButton';

test('スナップショット', () => {
	const { container } = render(<SubmitButton />);
	expect(container).toMatchSnapshot(); // DOM 変更で即壊れる
});
```

### Hooks

- `renderHook` を使い、入力引数と返却値（状態/関数）の組み合わせを重点的に確認する。
- 副作用 (`useEffect`) が依存に応じて正しく再実行されるか、依存配列の変化を意図した順番でシミュレートする。
- 非同期 Hook は `waitFor`/`act` を組み合わせ、ローディング状態→成功/失敗を網羅する。
- グローバル状態（Store/Context）を触る場合は、Hook 専用モック Store を注入して単体性を保つ。

#### 良い例

```ts
import { renderHook, act } from '@testing-library/react';
import { useCounter } from '../useCounter';

describe('useCounter', () => {
	it('increment が値を 1 増やす', () => {
		const { result } = renderHook(() => useCounter({ initial: 0 }));

		act(() => {
			result.current.increment();
		});

		expect(result.current.value).toBe(1);
	});
});
```

#### 悪い例

```ts
import { useCounter } from '../useCounter';

test('値が変わること', () => {
	const hook = useCounter({ initial: 0 }); // 実行不能、Hook ルール違反
	hook.increment();
	expect(hook.value).toBe(1);
});
```

### API クライアント

- HTTP 層をモックする（`fetch`/`axios`/`msw` 等）。固定レスポンスとエラーレスポンスを明示し、ログやリトライの副作用も確認する。
- リクエストビルド（URL/クエリ/ヘッダー/ボディ）が仕様通りか、`expect(mock).toHaveBeenCalledWith` で検証する。
- タイムアウト・リトライ・バックオフなど制御フローがあれば、時間をフェイク化してパスごとにテストを分ける。
- セキュリティ: 認証ヘッダーや PII をログ出力しないことをアサートする。

#### 良い例

```ts
import { fetchUser } from '../client';

describe('fetchUser', () => {
	beforeEach(() => {
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
			ok: true,
			json: () => Promise.resolve({ id: 'u1', name: 'Alice' }),
		}));
	});

	it('正しいパスで GET する', async () => {
		await fetchUser('u1');
		expect(fetch).toHaveBeenCalledWith('/api/users/u1', expect.any(Object));
	});
});
```

#### 悪い例

```ts
import { fetchUser } from '../client';

test('ユーザー取得', async () => {
	await fetchUser('u1');
	// HTTP をモックせず実 API を叩く → 不安定で遅い
});
```

### ユーティリティ（フォーマッタ/パーサ/変換）

- 同値類・境界値を網羅し、特に空文字/null/undefined/異常フォーマットを重点的に扱う。
- 変換系は「入力 → 出力」のペアをテーブル化し、`test.each` で表形式にすると可読性が上がる。
- 浮動小数/丸め/ロケール依存は、期待値を固定し誤差許容範囲 (`toBeCloseTo`) を設定する。

#### 良い例

```ts
import { formatCurrency } from '../formatCurrency';

describe('formatCurrency', () => {
	test.each([
		{ value: 0, expected: '¥0' },
		{ value: 1234.5, expected: '¥1,235' },
	])('値 $value を整形', ({ value, expected }) => {
		expect(formatCurrency(value)).toBe(expected);
	});
});
```

#### 悪い例

```ts
import { formatCurrency } from '../formatCurrency';

test('フォーマットされる', () => {
	expect(formatCurrency(1234)).toBeTruthy(); // 何を期待しているか分からない
});
```

### ピュア関数/ドメインロジック

- 副作用がない前提で、期待出力のみを検証するシンプルなテストにする。
- ガード節・例外パスは個別の `describe` で切り分け、`throws` を確実に検証する。
- 複数条件分岐は判定表を作り `test.each` で網羅。条件ごとの期待値が一望できる形を維持する。

#### 良い例

```ts
import { calcDiscount } from '../calcDiscount';

describe('calcDiscount', () => {
	it('閾値を超えると 10% 割引', () => {
		expect(calcDiscount({ price: 1000, isVip: false })).toBe(900);
	});

	it('VIP は常に 20% 割引', () => {
		expect(calcDiscount({ price: 1000, isVip: true })).toBe(800);
	});
});
```

#### 悪い例

```ts
import { calcDiscount } from '../calcDiscount';

test('割引される', () => {
	calcDiscount({ price: 1000, isVip: false });
	// アサーションなし、期待が不明
});
```

## ケーススタディ: timing/debounce 系ユーティリティ

- 対象: [src/lib/shared/timing/debounce.ts](src/lib/shared/timing/debounce.ts)
- テスト配置想定: [src/lib/shared/timing/_tests/debounce.test.ts](src/lib/shared/timing/_tests/debounce.test.ts)

### テスト観点一覧

| 関数              | シナリオ                          | 入力                            | 期待する結果                                        |
| ----------------- | --------------------------------- | ------------------------------- | --------------------------------------------------- |
| `debounce`        | 連打しても最後の呼び出しのみ実行  | `delay=50`, シリアルで 3 回呼ぶ | callback が最後の引数で 1 回だけ呼ばれる            |
| `debounce`        | `cancel` が保留中のタイマーを破棄 | 呼び出し → `cancel` → 時間経過  | callback が呼ばれない                               |
| `debounce`        | `this` バインドが保持される       | `function` として呼び出し       | callback が `this` を共有する                       |
| `debounceLeading` | 初回のみ即時実行                  | 連続呼び出し                    | 最初の 1 回だけ callback が実行され、delay 中は無視 |
| `debounceLeading` | `noExtend=true` で延長しない      | 連打                            | ロック期間が固定で、指定時間後に再度実行可能        |
| `debounceLeading` | `cancel` でロック解除             | 実行後に `cancel`               | 直後の呼び出しで再実行できる                        |

### 推奨テスト実装スケッチ

```ts
import { vi, describe, it, expect, beforeEach } from 'vitest';
import debounce, { debounceLeading } from '../debounce';

describe('debounce 系', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	it('連続呼び出しで最後の引数のみ渡す', () => {
		const fn = vi.fn();
		const debounced = debounce(fn, 50);

		debounced('a');
		debounced('b');
		debounced('c');
		vi.advanceTimersByTime(49);
		expect(fn).not.toHaveBeenCalled();

		vi.advanceTimersByTime(1);
		expect(fn).toHaveBeenCalledTimes(1);
		expect(fn).toHaveBeenCalledWith('c');
	});

	it('debounceLeading は初回のみ即時実行', () => {
		const fn = vi.fn();
		const leading = debounceLeading(fn, 50);

		leading('a');
		leading('b');
		expect(fn).toHaveBeenCalledTimes(1);
		expect(fn).toHaveBeenCalledWith('a');

		vi.advanceTimersByTime(51);
		leading('c');
		expect(fn).toHaveBeenCalledWith('c');
	});
});
```

### セキュリティ・非機能チェック

- ログ出力なし: ユーティリティ自体はログを持たないため、テストでも不要な `console` モックは作らない。
- パフォーマンス: フェイクタイマーで制御し、実時間待機を発生させない。
- 並行実行: `this` バインドを変えて複数インスタンスを作るケースも追加検討する。

## ケーススタディ: API クライアント（generateApiAccessor）

- 対象: [src/lib/shared/fetch/core.ts](src/lib/shared/fetch/core.ts)
- 利用例: [src/features/api/shared/internal.ts](src/features/api/shared/internal.ts)
- テスト配置想定: [src/lib/shared/fetch/_tests/core.test.ts](src/lib/shared/fetch/_tests/core.test.ts)

### テスト観点一覧

| シナリオ           | 入力/条件                               | 期待する結果                                                             |
| ------------------ | --------------------------------------- | ------------------------------------------------------------------------ |
| GET リクエスト生成 | `api.get('/v1/users/{id}', { params })` | `fetch` が正しい URL（path 置換 + query）・ヘッダーで呼ばれる            |
| POST ボディ整形    | `api.post('/v1/users', { body })`       | `requestBodyStringfy` により File/Blob が Base64 化され、JSON として送信 |
| パスパラ不足       | `params.path` に不足キー                | `replacePathParams` がエラーを投げる                                     |
| レスポンス解析     | `fetch` が JSON を返す/204 を返す       | `responseParser` が JSON or `undefined` を返す                           |
| インターセプタ発火 | `interceptors.fetchAfter` を指定        | 成功/失敗問わず 1 回呼ばれ、status/URL を渡す                            |
| エラー応答         | `fetch` が `ok=false`                   | エラーレスポンスでも JSON を解析し、呼び出し側で扱える                   |

### 推奨テスト実装スケッチ

```ts
import { generateApiAccessor } from '../core';

describe('generateApiAccessor', () => {
	beforeEach(() => {
		vi.stubGlobal('fetch', vi.fn());
	});

	it('GET で path/query/header を構築する', async () => {
		(fetch as unknown as vi.Mock).mockResolvedValue({
			ok: true,
			status: 200,
			statusText: 'OK',
			text: () => Promise.resolve('{"id":"u1"}'),
		});
		const api = generateApiAccessor<{ '/v1/users/{id}': { get: {} } }>();

		await api.get('/v1/users/{id}', {
			path: { id: 'u1' },
			query: { q: 'a' },
			header: { 'X-Test': '1' },
		});

		expect(fetch).toHaveBeenCalledWith('/v1/users/u1?q=a', {
			method: 'GET',
			headers: expect.objectContaining({ 'X-Test': '1' }),
		});
	});

	it('fetchAfter インターセプタが呼ばれる', async () => {
		(fetch as unknown as vi.Mock).mockResolvedValue({
			ok: false,
			status: 500,
			statusText: 'NG',
			text: () => Promise.resolve('{"error":"x"}'),
		});
		const after = vi.fn();
		const api = generateApiAccessor<{ '/v1/ping': { post: {} } }>({
			interceptors: { fetchAfter: after },
		});

		await api.post('/v1/ping', {});

		expect(after).toHaveBeenCalledWith(expect.objectContaining({ status: 500 }));
	});
});
```

### セキュリティ・非機能チェック

- 実ネットワークを叩かない: `fetch` を完全モックし、MSW などは統合/E2E で使用する。
- 機微情報ログ: インターセプタでログを取る場合、テストで PII が含まれていないか確認する。
- 並列実行: 複数 API 呼び出しが同時進行してもグローバル状態を共有しないことを `Promise.all` で検証する。

## AI エージェント向け作業手順

1. 対象 API の公開インターフェースと契約を確認し、テスト対象を列挙する。
2. 入出力の代表ケースと境界ケースを選定する（上記チェックリスト参照）。
3. 非決定要素を洗い出し、モック/スタブ方針を決める。
4. Arrange/Act/Assert の順でテストを書く。可読性を優先し、不要なヘルパーを作らない。
5. 実装変更に強いテストかを自己レビューし、冗長な共有化や抽象化を避ける。

## レビュー観点

- テスト名が期待する振る舞いを説明しているか。
- 非決定要素が排除されているか。
- 不要なモックや過剰な抽象化がないか。
- セキュリティ観点（ログに秘密情報が出ないか等）が担保されているか。

## 参考

- 他ドキュメントとの関係は [docs/architectures/index.md](./index.md) を参照。
