/* eslint-disable no-undef */
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

async function runMigration() {
  const pool = new Pool({
    host: process.env.DATABASE_HOST || "localhost",
    port: Number(process.env.POSTGRES_PORT || 5432),
    user: process.env.POSTGRES_USER || "postgres",
    password: process.env.POSTGRES_PASSWORD || "password",
    database: process.env.POSTGRES_DB || "template",
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 2_000,
  });

  const db = drizzle(pool);

  process.stdout.write("[migrate] Start migration..\n");

  try {
    await migrate(db, { migrationsFolder: "./drizzle" });
    process.stdout.write("[migrate] done.\n");
  } catch (error) {
    process.stderr.write(`[migrate] failed.\n${JSON.stringify(error, null, 2)}\n`);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
