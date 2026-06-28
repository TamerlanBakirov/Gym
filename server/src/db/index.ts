import { env } from '../env.js';
import type { Db } from './driver.js';
import { createSqliteDb } from './sqlite.js';
import { createPostgresDb } from './postgres.js';

/**
 * Singleton database. Uses Postgres when DATABASE_URL is set, otherwise SQLite.
 * Repositories depend only on the `Db` interface, so they work with either.
 */
export const db: Db = env.DATABASE_URL
  ? createPostgresDb(env.DATABASE_URL)
  : createSqliteDb(env.DATABASE_PATH);

export async function migrate(): Promise<void> {
  await db.init();
}

export async function closeDb(): Promise<void> {
  await db.close();
}

export type { Db } from './driver.js';
