import { db } from '../../db/index.js';
import { uid, sha256 } from '../../lib/crypto.js';

export type AuthTokenType = 'verify' | 'reset';

export const authTokensRepo = {
  /** Replace any existing codes of this type and store a new one. */
  async create(
    userId: string,
    type: AuthTokenType,
    code: string,
    expiresAt: Date
  ): Promise<void> {
    await db.run(`DELETE FROM auth_tokens WHERE user_id = ? AND type = ?`, [userId, type]);
    await db.run(
      `INSERT INTO auth_tokens (id, user_id, type, code_hash, expires_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [uid(), userId, type, sha256(code), expiresAt.toISOString(), new Date().toISOString()]
    );
  },

  /** Validate a code; on success consume it and return true. */
  async consume(userId: string, type: AuthTokenType, code: string): Promise<boolean> {
    const row = await db.one<{ id: string; expires_at: string }>(
      `SELECT id, expires_at FROM auth_tokens WHERE user_id = ? AND type = ? AND code_hash = ?`,
      [userId, type, sha256(code)]
    );
    if (!row) return false;
    await db.run(`DELETE FROM auth_tokens WHERE id = ?`, [row.id]);
    if (new Date(row.expires_at).getTime() < Date.now()) return false;
    return true;
  },
};
