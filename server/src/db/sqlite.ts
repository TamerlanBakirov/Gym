import { DatabaseSync } from 'node:sqlite';
import { readFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Db } from './driver.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** SQLite adapter backed by Node's built-in node:sqlite (synchronous, wrapped as async). */
export function createSqliteDb(databasePath: string): Db {
  const dbPath = resolve(process.cwd(), databasePath);
  mkdirSync(dirname(dbPath), { recursive: true });
  const sqlite = new DatabaseSync(dbPath);

  // node:sqlite binds undefined poorly; coerce undefined → null.
  const norm = (params: unknown[] = []) => params.map((p) => (p === undefined ? null : p));

  return {
    dialect: 'sqlite',

    async query<T>(sql: string, params: unknown[] = []): Promise<T[]> {
      return sqlite.prepare(sql).all(...(norm(params) as never[])) as unknown as T[];
    },

    async one<T>(sql: string, params: unknown[] = []): Promise<T | null> {
      const row = sqlite.prepare(sql).get(...(norm(params) as never[]));
      return (row as T) ?? null;
    },

    async run(sql: string, params: unknown[] = []) {
      const res = sqlite.prepare(sql).run(...(norm(params) as never[]));
      return { changes: Number(res.changes) };
    },

    async exec(sql: string) {
      sqlite.exec(sql);
    },

    async init() {
      const sql = readFileSync(resolve(__dirname, 'schema.sqlite.sql'), 'utf8');
      sqlite.exec(sql);
    },

    async close() {
      sqlite.close();
    },
  };
}
