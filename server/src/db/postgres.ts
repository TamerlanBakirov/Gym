import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import { toPgPlaceholders, type Db } from './driver.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Return BIGINT (int8, oid 20) as a JS number so COUNT(*) etc. aren't strings.
pg.types.setTypeParser(20, (v) => parseInt(v, 10));

/** Postgres adapter backed by a connection pool. SQL uses `?` placeholders. */
export function createPostgresDb(connectionString: string): Db {
  const pool = new pg.Pool({ connectionString });

  return {
    dialect: 'postgres',

    async query<T>(sql: string, params: unknown[] = []): Promise<T[]> {
      const res = await pool.query(toPgPlaceholders(sql), params as unknown[]);
      return res.rows as T[];
    },

    async one<T>(sql: string, params: unknown[] = []): Promise<T | null> {
      const res = await pool.query(toPgPlaceholders(sql), params as unknown[]);
      return (res.rows[0] as T) ?? null;
    },

    async run(sql: string, params: unknown[] = []) {
      const res = await pool.query(toPgPlaceholders(sql), params as unknown[]);
      return { changes: res.rowCount ?? 0 };
    },

    async exec(sql: string) {
      await pool.query(sql);
    },

    async init() {
      const sql = readFileSync(resolve(__dirname, 'schema.postgres.sql'), 'utf8');
      await pool.query(sql);
    },

    async close() {
      await pool.end();
    },
  };
}
