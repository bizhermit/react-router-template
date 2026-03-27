# インテグレーションテスト仕様

ユニットテスト済みのモジュール同士が結合した際の契約を検証し、実行時の設定・ストレージ・外部依存とのやり取りを確認するための指示書。アーキテクチャ全体のテスト構成は [docs/architectures/test/index.md](./index.md) を参照し、本書はインテグレーションテストに限定する。

> **CI 実行**: インテグレーションテストも `npm run test`（Vitest）で実行される。特定ファイルのみ実行したい場合は `npx vitest run src/path/to/test.int.test.ts` を使用する。

> **命名規約**: テスト種別サフィックスは `unit / int / comp` を採用する。インテグレーションテストは `*.int.test.ts(x)` とする（互換のため既存 `*.integration.test.ts(x)` も当面許容）。

> **運用優先度**: 本書は人間レビューにも対応するが、AI エージェントによる自動実行手順を優先する。AI は本書の「AI エージェント向け手順」と「実行結果レポート（必須フォーマット）」を満たすこと。

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
| 外部 HTTP     | MSW もしくは `vi.stubGlobal("fetch", ...)` でスタブし、期待呼び出しを検証する             |
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

### 非同期処理の制御パターン

```ts
import { vi, describe, it, expect } from "vitest";

// タイムアウト検出
describe("非同期処理: タイムアウト", () => {
  it("API 呼び出しが指定時間内に完了しない場合は タイムアウト", async () => {
    const slowFetch = vi.fn(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10000));
      return { data: "result" };
    });

    const timeoutPromise = Promise.race([
      slowFetch(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("TIMEOUT")), 5000),
      ),
    ]);

    await expect(timeoutPromise).rejects.toThrow("TIMEOUT");
  });
});

// race 条件の回避
describe("非同期処理: Race 条件", () => {
  it("複数の同一リソース更新が正しくシリアライズされる", async () => {
    let updateOrder: number[] = [];

    const update = async (id: number, delay: number) => {
      await new Promise((resolve) => setTimeout(resolve, delay));
      updateOrder.push(id);
    };

    // Promise.all で並列実行を再現
    await Promise.all([
      update(1, 100),
      update(2, 50),
      update(3, 150),
    ]);

    // 実装が順序保証している場合は、最後の更新のみが反映される想定
    expect(updateOrder).toEqual([2, 1, 3]);
  });
});
```

## ターゲット別ガイド

### API ルート / Loader

- `createStaticHandler` / `createStaticRouter` を使ってルート全体を起動し、`loader` の実レスポンスを取得する。
- 認証ヘッダーや Cookie を実際の API と同じ形で注入し、リダイレクトや 4xx/5xx を含むパスを網羅する。
- ログ出力は `vi.spyOn(console, "log")` などで傍受し、秘匿情報が含まれないことを確認する。

**エラーハンドリングの実装例**:

```ts
import { describe, it, expect, vi } from "vitest";
import { createStaticHandler } from "react-router";

describe("API ルート エラーハンドリング", () => {
  it("401 認証失敗時は redirect レスポンスを返す", async () => {
    const handler = createStaticHandler([{
      path: "/protected",
      loader: async ({ request }) => {
        const auth = request.headers.get("authorization");
        if (!auth) throw new Response(null, { status: 401 });
        return { data: "success" };
      },
    }]);

    const result = await handler.query(
      new Request("http://localhost/protected"),
    );

    expect(result).toBeInstanceOf(Response);
    expect(result.status).toBe(401);
  });

  it("500 エラー時にスタックトレースが response に含まれない", async () => {
    const logSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const handler = createStaticHandler([{
      path: "/error",
      loader: async () => {
        throw new Error("DATABASE_SECRET_xyz");
      },
    }]);

    const result = await handler.query(
      new Request("http://localhost/error"),
    );
    const body = await result.text();

    expect(body).not.toContain("DATABASE_SECRET");
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("DATABASE_SECRET"));
  });
});
```

### リポジトリ / DB アクセス

- 実 DB と接続し、スキーマ制約やトリガーが効いているかを確認する。
- 複数テーブルを跨ぐ操作はトランザクション単位で検証し、途中失敗時のロールバックもテストする。

**複数テーブル・トランザクション失敗の実装例**:

```ts
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { db, transaction } from "../database";
import { withTestTransaction } from "../../../tests/utils/integration";

describe("複数テーブル トランザクション検証", () => {
  it("ユーザー作成と プロフィール作成が同一トランザクション内で成功", async () => {
    await withTestTransaction(async (trx) => {
      const userId = await db.user.create(
        { name: "Test User", email: "test@example.com" },
        { trx },
      );
      const profileId = await db.profile.create(
        { userId, bio: "Hello" },
        { trx },
      );

      // トランザクション内で検証
      const user = await db.user.findById(userId, { trx });
      const profile = await db.profile.findById(profileId, { trx });

      expect(user).toBeDefined();
      expect(profile.userId).toBe(userId);
    });

    // トランザクション終了後も整合性を確認
    const user = await db.user.findByEmail("test@example.com");
    expect(user).toBeDefined();
  });

  it("プロフィール作成失敗時にユーザー作成もロールバック", async () => {
    let userId: string | null = null;

    try {
      await withTestTransaction(async (trx) => {
        userId = await db.user.create(
          { name: "Test User 2", email: "test2@example.com" },
          { trx },
        );
        // 一意制約違反を故意に引き起こす
        await db.profile.create(
          { userId, bio: "Profile1" },
          { trx },
        );
        await db.profile.create(
          { userId, bio: "Profile2" },  // 同一ユーザーで2つ目のプロフィール（制約違反）
          { trx },
        );
      });
    } catch (error) {
      // ロールバック確認
    }

    // ユーザーが作成されていないことを確認
    const user = await db.user.findByEmail("test2@example.com");
    expect(user).toBeUndefined();
  });
});
```

**ヘルパー関数 API 仕様**:

```ts
// withTestTransaction: テストケース単位でのトランザクション管理
// - 開始時: BEGIN
// - 終了時: ROLLBACK（失敗時も含む）
export function withTestTransaction<T>(
  callback: (trx: Transaction) => Promise<T>,
): Promise<T>

// truncateTables: 指定テーブルを全削除（トランザクション外）
// - 用途: テスト間のクリーンアップ、初期状態リセット
export function truncateTables(
  tableNames: string[],
): Promise<void>

// seedData: 共通初期データ投入（マイグレーション済み前提）
// - 既存データは上書きしない
// - テスト内での追加データはコールバック内で個別生成
export function seedData(
  tables: Record<string, any[]>,
): Promise<void>
```

### バッチ / ジョブ

- 実行キュー（例: BullMQ 相当）のテストダブルを起動し、ジョブ投入→実行→再試行までのイベントを検証する。
- スケジューラはフェイクタイマーを使って時間を進め、予定どおりジョブが発火するか確認する。

**バッチ・ジョブキューの実装例**:

```ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { Queue } from "bullmq";
import { DateTime } from "../lib/shared/timing";

describe("バッチジョブ 実行フロー", () => {
  let queue: Queue;

  beforeEach(async () => {
    vi.useFakeTimers();
    // メモリキューまたはテスト用キュー実装
    queue = new Queue("test-queue", { connection: { host: "localhost" } });
    await queue.clear();
  });

  it("ジョブ投入→実行→完了までのフロー", async () => {
    const jobProcessor = vi.fn(async (job) => {
      await db.log.create({
        jobId: job.id,
        status: "processed",
        timestamp: DateTime.now(),
      });
      return { success: true };
    });

    queue.process(jobProcessor);

    // ジョブ投入
    const job = await queue.add("send-email", {
      userId: "user-123",
      template: "welcome",
    });

    // ジョブ実行をシミュレート（fakeTimer で時間進行）
    vi.advanceTimersByTime(1000);
    await vi.runAllTimersAsync();

    expect(jobProcessor).toHaveBeenCalled();
    const log = await db.log.findByJobId(job.id);
    expect(log?.status).toBe("processed");
  });

  it("ジョブ失敗→リトライ→成功", async () => {
    let attemptCount = 0;
    const jobProcessor = vi.fn(async (job) => {
      attemptCount++;
      if (attemptCount < 2) {
        throw new Error("Temporary failure");
      }
      return { success: true };
    });

    queue.process(jobProcessor);
    const job = await queue.add("retry-job", { data: "test" }, {
      attempts: 3,
      backoff: { type: "exponential", delay: 1000 },
    });

    // 1回目失敗
    vi.advanceTimersByTime(1000);
    await vi.runAllTimersAsync();

    // 2回目成功
    vi.advanceTimersByTime(2000);
    await vi.runAllTimersAsync();

    expect(jobProcessor).toHaveBeenCalledTimes(2);
    expect(job.progress()).toEqual({ completed: true });
  });
});
```

### キャッシュ / Feature Flag

- Redis 代替として in-memory 実装を使う場合でも、TTL・ミスヒット時の挙動をアサートする。
- Feature Flag は複数の組み合わせを `test.each` で列挙し、権限やロールが正しく反映されるか確認する。

**キャッシュ・Feature Flag の実装例**:

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { cache } from "../lib/cache";
import { featureFlags } from "../features/flags";

describe("キャッシュ機構 TTL・ミスヒット", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    cache.clear();
  });

  it("TTL 切れ後にキャッシュが無効化される", async () => {
    await cache.set("user:123", { id: "123", name: "John" }, 5000); // 5秒 TTL

    expect(await cache.get("user:123")).toBeDefined();

    // 3秒経過
    vi.advanceTimersByTime(3000);
    expect(await cache.get("user:123")).toBeDefined();

    // 5秒経過（TTL 切れ）
    vi.advanceTimersByTime(2000);
    expect(await cache.get("user:123")).toBeUndefined();
  });

  it("キャッシュミスヒット時に DB へフォールバック", async () => {
    const dbSpy = vi.spyOn(db.user, "findById");
    const data = { id: "456", name: "Jane" };
    dbSpy.mockResolvedValue(data);

    // キャッシュに データなし
    const result = await cache.getOrFetch(
      "user:456",
      () => db.user.findById("456"),
      5000,
    );

    expect(result).toEqual(data);
    expect(dbSpy).toHaveBeenCalledOnce();

    // 次回呼び出しはキャッシュから
    const result2 = await cache.getOrFetch(
      "user:456",
      () => db.user.findById("456"),
      5000,
    );

    expect(result2).toEqual(data);
    expect(dbSpy).toHaveBeenCalledOnce(); // 呼び出し増加なし
  });
});

describe("Feature Flag 権限・ロール連携", () => {
  const testCases = [
    { role: "admin", flag: "beta-features", expected: true },
    { role: "user", flag: "beta-features", expected: false },
    { role: "user", flag: "standard-features", expected: true },
  ];

  it.each(testCases)(
    "ロール $role は $flag を $expected",
    async ({ role, flag, expected }) => {
      const user = { id: "test", role };
      const result = await featureFlags.isEnabled(flag, user);
      expect(result).toBe(expected);
    },
  );
});
```

## 観測・セキュリティ点検

### チェックリスト

- [ ] **ログ・トレース** — ログ/メトリクス/トレースが期待フォーマットになっているか、不要な個人情報を含まないかを検証する
- [ ] **エラーレスポンス** — エラー時のレスポンス本文にスタックトレース・DB スキーマ情報・シークレットが混入していないことを確認
- [ ] **CSP・ヘッダー** — リクエスト/レスポンスの CSP・CORS・認証ヘッダー設定がセキュリティチェックリストに合致するか
- [ ] **SQL インジェクション** — パラメータバインディングが正しく使用されているか、ユーザー入力が直接クエリに含まれていないか
- [ ] **認可** — サーバー側で必ず再検証されているか（クライアント側判定のみではないか）
- [ ] **レート制限** — API エンドポイントが意図したレート制限で保護されているか

### インジェクション脆弱性テストの実装例

```ts
import { describe, it, expect } from "vitest";
import { db } from "../database";

describe("セキュリティ: SQLインジェクション対策", () => {
  it("ユーザー検索時に SQL インジェクション攻撃を受け付けない", async () => {
    // 攻撃ペイロード
    const maliciousInput = "admin' OR '1'='1";

    // プレースホルダー使用での実装（安全）
    const result = await db.user.findByEmail(maliciousInput);

    // 検索対象は email カラムのみで、他の行が返されない
    expect(result).toBeUndefined();
  });

  it("API レスポンスにスキーマ情報を含めない", async () => {
    const response = await fetch("http://localhost/api/invalid-endpoint", {
      method: "GET",
    });

    const body = await response.text();
    expect(body).not.toContain("table");
    expect(body).not.toContain("column");
    expect(body).not.toContain("schema");
    expect(response.status).toBe(404);
  });
});

describe("セキュリティ: 認可検証", () => {
  it("サーバー側で認可を再検証（クライアント側判定に依存しない）", async () => {
    const unauthorizedToken = "invalid_token";

    const response = await fetch("http://localhost/api/admin/users", {
      method: "GET",
      headers: { authorization: `Bearer ${unauthorizedToken}` },
    });

    expect(response.status).toBe(401);
    // ただし認可失敗時のエラーメッセージには権限情報を含めない
    const body = await response.json();
    expect(body.message).not.toContain("admin");
  });

  it("ユーザーが他ユーザーのデータにアクセスできない", async () => {
    const userAToken = await createTestToken("user-a");
    const userBId = "user-b-id";

    const response = await fetch(
      `http://localhost/api/users/${userBId}/profile`,
      {
        headers: { authorization: `Bearer ${userAToken}` },
      },
    );

    expect(response.status).toBe(403);
  });
});

describe("セキュリティ: データマスキング", () => {
  it("ログまたはエラーメッセージに PII が含まれない", async () => {
    const logSpy = vi.spyOn(console, "log");

    await db.user.create({
      name: "John Doe",
      email: "john@example.com",
      ssn: "123-45-6789",
    });

    expect(logSpy).not.toHaveBeenCalledWith(expect.stringContaining("123-45-6789"));
    expect(logSpy).not.toHaveBeenCalledWith(expect.stringContaining("john@example.com"));
  });
});
```

## ケーススタディ: health ルートの Loader

- 対象: [src/app/routes/health.ts](/src/app/routes/health.ts)
- 目的: Loader が `DateTime` ラッパーと React Router の `data` を組み合わせ、環境変数情報をログに出力しつつ現在時刻を返すことを保証する。
- テスト配置案: [src/app/routes/_tests/health.int.test.ts](src/app/routes/_tests/health.int.test.ts)

### テスト観点一覧

| シナリオ | 前提/入力                                                          | 期待する結果                                           |
| -------- | ------------------------------------------------------------------ | ------------------------------------------------------ |
| 正常応答 | `loader()` を直接呼び出し、`process.env.NODE_ENV` を `test` に設定 | `data()` から `now` が ISO 文字列で返る                |
| ログ検証 | `console.log` をスパイ化                                           | ログに Node バージョンと環境名だけが含まれ、PII がない |
| 時刻固定 | `vi.setSystemTime("2024-01-01T00:00:00Z")`                         | レスポンスの `now` が固定値になる                      |

### 推奨テスト実装スケッチ

```ts
import { vi, describe, it, expect, beforeEach } from "vitest";
import { loader } from "../../health";

describe("health loader (integration)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-01T00:00:00Z"));
  });

  it("現在時刻を返しログを残す", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    process.env.NODE_ENV = "test";

    const response = await loader();

    expect(response).toMatchObject({
      payload: {
        now: "2024-01-01T00:00:00.000Z",
      },
    });
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("healthcheck"));
    expect(logSpy).not.toHaveBeenCalledWith(expect.stringContaining("SECRET"));
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

### 完了条件（AI 自動実行）

- 対象境界の主要シナリオで、レスポンスと副作用の両方が検証されている。
- 非決定要素（時間・乱数・並列実行）が制御されている。
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

- 全体構成: [docs/architectures/test/index.md](./index.md)
- ユニットテスト方針: [docs/architectures/test/unit-test.md](./unit-test.md)
- セキュリティ観点: [docs/architectures/security-checklist.md](../security-checklist.md)
