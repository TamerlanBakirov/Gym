import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Server } from 'node:http';

export interface TestContext {
  base: string;
  server: Server;
  close: () => Promise<void>;
}

/**
 * Boot the API on an ephemeral port backed by a throwaway SQLite database.
 * Env vars are set before the app modules are imported so config picks them up.
 */
export async function startTestServer(): Promise<TestContext> {
  const dir = mkdtempSync(join(tmpdir(), 'forge-test-'));
  process.env.DATABASE_PATH = join(dir, 'test.db');
  process.env.DATABASE_URL = ''; // force SQLite
  process.env.JWT_ACCESS_SECRET = 'test-access-secret-value';
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-value';
  process.env.NODE_ENV = 'test';

  const { createApp } = await import('../src/app.js');
  const { migrate, closeDb } = await import('../src/db/index.js');
  const { ensureSeeded } = await import('../src/db/seed.js');

  await migrate();
  await ensureSeeded();

  const app = createApp();
  const server = await new Promise<Server>((resolve) => {
    const s = app.listen(0, () => resolve(s));
  });
  const addr = server.address();
  const port = typeof addr === 'object' && addr ? addr.port : 0;

  return {
    base: `http://127.0.0.1:${port}`,
    server,
    close: async () => {
      await new Promise<void>((resolve) => server.close(() => resolve()));
      await closeDb();
    },
  };
}

type Json = Record<string, unknown>;

/** Minimal typed HTTP helper for tests. */
export function makeClient(base: string) {
  let token: string | null = null;
  return {
    setToken(t: string | null) {
      token = t;
    },
    async req(method: string, path: string, body?: unknown) {
      const res = await fetch(`${base}${path}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
      const text = await res.text();
      const data = (text ? JSON.parse(text) : null) as Json | null;
      return { status: res.status, data };
    },
  };
}
