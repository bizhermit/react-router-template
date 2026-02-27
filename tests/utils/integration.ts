import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool, type PoolClient, type PoolConfig } from "pg";

/**
 * インテグレーションテスト向けの DB インスタンスを生成する際の基本設定。
 * 実際の `.env` と乖離するとテストが失敗するため、必要に応じてオーバーライドする。
 */
const defaultPoolConfig: PoolConfig = {
  host: process.env.DATABASE_HOST || "localhost",
  port: Number(process.env.POSTGRES_PORT || 5432),
  user: process.env.POSTGRES_USER || "postgres",
  password: process.env.POSTGRES_PASSWORD || "password",
  database: process.env.POSTGRES_DB || "template",
  max: 2,
  idleTimeoutMillis: 10_000,
};

export type TestDatabase = NodePgDatabase<Record<string, never>>;

/**
 * インテグレーションテスト用の `Pool` を生成する。
 */
export function createTestPool(overrides?: Partial<PoolConfig>) {
  return new Pool({
    ...defaultPoolConfig,
    ...overrides,
  });
}

/**
 * 各テストケースをトランザクション内で実行し、終了後にロールバックするユーティリティ。
 * トランザクション完了後はコネクションを自動で解放する。
 */
export async function withTestTransaction<T>(
  handler: (context: { db: TestDatabase; client: PoolClient; }) => Promise<T>,
  options?: { poolOverrides?: Partial<PoolConfig>; },
) {
  const pool = createTestPool(options?.poolOverrides);
  const client = await pool.connect();
  await client.query("BEGIN");
  const transactionalDb = drizzle(client);
  try {
    const result = await handler({
      db: transactionalDb,
      client,
    });
    return result;
  } finally {
    await client.query("ROLLBACK");
    client.release();
    await pool.end();
  }
}

/**
 * 指定したテーブルを TRUNCATE し、ID シーケンスもリセットする。
 * fixture を明示的に初期化したいケースで利用する。
 */
export async function truncateTables(client: PoolClient, tableNames: string[]) {
  if (tableNames.length === 0) return;
  const identifiers = tableNames.map(name => {
    if (!/^[a-zA-Z0-9_.]+$/.test(name)) {
      throw new Error(`Invalid table name: ${name}`);
    }
    return `"${name}"`;
  }).join(", ");
  await client.query(`TRUNCATE ${identifiers} RESTART IDENTITY CASCADE`);
}
