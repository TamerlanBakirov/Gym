import { DatabaseSync } from 'node:sqlite';
import { readFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { env } from '../env.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Resolve the DB path relative to the server root (one level up from src/db at runtime).
const dbPath = resolve(process.cwd(), env.DATABASE_PATH);
mkdirSync(dirname(dbPath), { recursive: true });

export const db = new DatabaseSync(dbPath);

/** Apply the schema. Safe to run on every boot (all statements are IF NOT EXISTS). */
export function migrate(): void {
  const schemaPath = resolve(__dirname, 'schema.sql');
  const sql = readFileSync(schemaPath, 'utf8');
  db.exec(sql);
}

export function closeDb(): void {
  db.close();
}
