/** Database driver abstraction so the same repositories run on SQLite or Postgres. */
export interface Db {
  dialect: 'sqlite' | 'postgres';
  /** Run a SELECT, returning all rows. Use `?` placeholders. */
  query<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T[]>;
  /** Run a SELECT, returning the first row or null. */
  one<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T | null>;
  /** Run an INSERT/UPDATE/DELETE; returns affected row count. */
  run(sql: string, params?: unknown[]): Promise<{ changes: number }>;
  /** Execute one or more statements (DDL). No parameters. */
  exec(sql: string): Promise<void>;
  /** Apply the schema for this dialect. */
  init(): Promise<void>;
  close(): Promise<void>;
}

/** Convert `?` placeholders to Postgres `$1, $2, ...`. */
export function toPgPlaceholders(sql: string): string {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
}
