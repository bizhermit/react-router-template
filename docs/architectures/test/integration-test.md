# インテグレーションテスト仕様

ユニットテスト済みのモジュール同士が結合した際の契約を検証し、実行時の設定・ストレージ・外部依存とのやり取りを確認するための指示書。アーキテクチャ全体のテスト構成は [docs/architectures/test/index.md](./index.md) を参照し、本書はインテグレーションテストに限定する。

> **CI 実行**: インテグレーションテストも `npm run test`（Vitest）で実行される。特定ファイルのみ実行したい場合は `npx vitest run src/path/to/test.integration.test.ts` を使用する。

## クイックスタート

1. **対象境界を決める** — どのモジュール間の契約を検証するか明確にし、表形式で入力/出力を整理する。
2. **テストベッドを起動** — `npm run dev:postgres` など必要なミドルウェアを Docker で立ち上げ、`.env.test` 相当の設定を読み込む。
3. **データ初期化** — マイグレーションとシードを適用し、テストケースごとにトランザクションを開始/終了する。
4. **実処理を経由したシナリオ実行** — HTTP/API/Loader/Repository を実際のスタック経由で呼び出す。外部サービスのみスタブ化する。
5. **振る舞いを検証** — レスポンス、DB・メッセージ副作用、ログ出力（秘匿情報が含まれないこと）を確認する。

> **Checklist**
> - [ ] 対象境界と前提条件をテストケース冒頭にコメント化している
> - [ ] 実ストレージ（または Testcontainer）を使用し、整合性が担保されている
> - [ ] 外部サービスは MSW などでスタブ化し、期待するトラフィックを検証している
> - [ ] 監査ログやマスキング要件をテストで確認している
> - [ ] フレークを避けるための時間制御やリトライ待機が deterministic になっている

## 基本方針

- **実スタック優先**: HTTP ルータ、ORM、キャッシュ層などは実装どおりのスタックをそのまま利用する。
- **副作用も検証**: レスポンスだけでなく DB の状態遷移、メッセージキュー投入、ログ出力など観測可能な副作用を全てアサートする。
- **テストごとに独立**: 各ケースはトランザクションや専用 schema を使い、互いに汚染しないようにする。
- **セキュリティ要件の再確認**: トークン、PII、シークレットがログ・レスポンスへ漏れないことを常に検証する。

## 対象となる検証

- ルータ/Loader/Controller とサービス層が連携した際の挙動。
- リポジトリと実 DB（Postgres/SQLite 等）の CRUD、一意制約、トランザクション振る舞い。
- バッチ/ジョブキュー/イベント駆動処理のエンドツーエンドな流れ（ただし外部システム呼び出しはスタブ）。
- キャッシュ・Feature Flag など共有状態の整合性。

## 対象外（別ドキュメント参照）

- 単体ロジックは [ユニットテスト仕様](./unit-test.md) でカバー済み。
- 全 UI フローやブラウザ相当の操作はコンポーネント/E2E テストへ移譲。
- 実外部サービスとの結合はステージングで行い、本ドキュメントではスタブ化のみ扱う。

## テストベッド構築

| 項目          | 推奨アプローチ                                                                            |
| ------------- | ----------------------------------------------------------------------------------------- |
| DB            | `docker/compose.dev.yml` を利用して Postgres を起動し、`npm run dev:migrate` で最新化する |
| 環境変数      | `.env.test` へ最小構成を記載し、Vitest 実行時に読み込む                                   |
| 認証          | `features/auth` のモックトークンを発行し、HTTP ヘッダーに注入する                         |
| 外部 HTTP     | MSW もしくは `vi.stubGlobal('fetch', ...)` でスタブし、期待呼び出しを検証する             |
| 時刻/タイマー | `vi.useFakeTimers()` で固定し、`DateTime` ラッパーに依存するコードの再現性を担保          |

> **Reusable helper**: DB まわりの初期化には [tests/utils/integration.ts](../../tests/utils/integration.ts) の `withTestTransaction` / `truncateTables` を利用し、全テストで同じパターンを踏襲する。

## データ管理

- **マイグレーション**: テスト開始前に `npm run generate:migration` → `npm run dev:migrate` を適用し、スキーマ差分をなくす。
- **シード**: `scripts/seed.ts` を使って共通初期データを投入。ケース独自のデータはテスト内で生成し、後片付けまで責任を持つ。
- **トランザクション制御**: 各テストで `BEGIN`→`ROLLBACK` を行うヘルパー（例: `withTestTransaction`）を用意し、DB 汚染を防止する。
- **ID 生成**: シーケンスや UUID は固定値に差し替えるか、期待値を計算可能な形で比較する。

## 外部依存とモック方針

- 内部サービス呼び出し（同一リポジトリ内）は実装をそのまま利用する。
- 外部 API は `fetch`/`axios` をスタブし、レスポンスとリクエスト検証を行う。同時にリトライやバックオフの副作用も確認する。
- メッセージキューや Pub/Sub は in-memory 実装へ差し替え、publish/consume の順序をテスト内で検証する。

## 非決定要素の扱い

- **時間**: `vi.setSystemTime` や `DateTime.freeze()` を用い、スケジューラの発火や TTL 計算を固定。
- **並列実行**: `Promise.all` で並列呼び出しを再現し、ロックや排他制御をアサートする。
- **ランダム値**: 乱数生成を DI で受け取り、テスト時は固定シードを注入する。

## ターゲット別ガイド

### API ルート / Loader

- `createStaticHandler` / `createStaticRouter` を使ってルート全体を起動し、`loader` の実レスポンスを取得する。
- 認証ヘッダーや Cookie を実際の API と同じ形で注入し、リダイレクトや 4xx/5xx を含むパスを網羅する。
- ログ出力は `vi.spyOn(console, 'log')` などで傍受し、秘匿情報が含まれないことを確認する。

### リポジトリ / DB アクセス

- 実 DB と接続し、スキーマ制約やトリガーが効いているかを確認する。
- 複数テーブルを跨ぐ操作はトランザクション単位で検証し、途中失敗時のロールバックもテストする。

### バッチ / ジョブ

- 実行キュー（例: BullMQ 相当）のテストダブルを起動し、ジョブ投入→実行→再試行までのイベントを検証する。
- スケジューラはフェイクタイマーを使って時間を進め、予定どおりジョブが発火するか確認する。

### キャッシュ / Feature Flag

- Redis 代替として in-memory 実装を使う場合でも、TTL・ミスヒット時の挙動をアサートする。
- Feature Flag は複数の組み合わせを `test.each` で列挙し、権限やロールが正しく反映されるか確認する。

## 観測・セキュリティ点検

- ログ/メトリクス/トレースが期待フォーマットになっているか、不要な個人情報を含まないかを検証する。
- エラー時のレスポンス本文にスタックトレースやシークレットが混入していないことを確認する。
- リクエスト/レスポンスの CSP・ヘッダー設定がセキュリティチェックリストに合致するかをテストに含める。

## ケーススタディ: health ルートの Loader

- 対象: [src/app/routes/health.ts](src/app/routes/health.ts)
- 目的: Loader が `DateTime` ラッパーと React Router の `data` を組み合わせ、環境変数情報をログに出力しつつ現在時刻を返すことを保証する。
- テスト配置案: [src/app/routes/_tests/health.integration.test.ts](src/app/routes/_tests/health.integration.test.ts)

### テスト観点一覧

| シナリオ | 前提/入力                                                          | 期待する結果                                           |
| -------- | ------------------------------------------------------------------ | ------------------------------------------------------ |
| 正常応答 | `loader()` を直接呼び出し、`process.env.NODE_ENV` を `test` に設定 | `data()` から `now` が ISO 文字列で返る                |
| ログ検証 | `console.log` をスパイ化                                           | ログに Node バージョンと環境名だけが含まれ、PII がない |
| 時刻固定 | `vi.setSystemTime('2024-01-01T00:00:00Z')`                         | レスポンスの `now` が固定値になる                      |

### 推奨テスト実装スケッチ

```ts
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { loader } from '../../health';

describe('health loader (integration)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T00:00:00Z'));
  });

  it('現在時刻を返しログを残す', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    process.env.NODE_ENV = 'test';

    const response = await loader();

    expect(response).toMatchObject({
      payload: {
        now: '2024-01-01T00:00:00.000Z',
      },
    });
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('healthcheck'));
    expect(logSpy).not.toHaveBeenCalledWith(expect.stringContaining('SECRET'));
  });
});
```

### セキュリティ・非機能チェック

- **ログマスキング**: Loader が出力するログにシークレットやユーザー情報が含まれていないかを確認する。
- **時刻依存排除**: フェイクタイマーを利用し、タイムゾーン差異による失敗を防ぐ。
- **実行時間**: Loader は軽量処理であるため、テストは 1 秒以内に完了することを確認し、遅延が発生した場合は依存のフェイク化を検討する。

## AI エージェント向け手順

1. 対象境界と依存ミドルウェアを一覧化し、起動手順をコメントに残す。
2. マイグレーションとシードを必ず適用し、テストデータ生成ロジックを再利用可能なヘルパーにまとめる。
3. 実スタック経由でシナリオを実行し、レスポンスと副作用の両方を検証する。
4. 非決定要素（時間、乱数、並列実行）を制御してからテストを実行する。
5. セキュリティチェックリスト（ログ/PII/ヘッダー）と照らし合わせて自己レビューする。

## 参考

- 全体構成: [docs/architectures/test/index.md](./index.md)
- ユニットテスト方針: [docs/architectures/test/unit-test.md](./unit-test.md)
- セキュリティ観点: [docs/architectures/security-checklist.md](../architectures/security-checklist.md)
