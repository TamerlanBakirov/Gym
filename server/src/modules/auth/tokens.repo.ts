import { db } from '../../db/index.js';
import { uid, sha256 } from '../../lib/crypto.js';

export const tokensRepo = {
  async store(userId: string, rawToken: string, expiresAt: Date): Promise<void> {
    await db.run(
      `INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [uid(), userId, sha256(rawToken), expiresAt.toISOString(), new Date().toISOString()]
    );
  },

  /** Returns the owning userId if the token is valid and unexpired, else null. */
  async resolve(rawToken: string): Promise<string | null> {
    const row = await db.one<{ user_id: string; expires_at: string }>(
      `SELECT user_id, expires_at FROM refresh_tokens WHERE token_hash = ?`,
      [sha256(rawToken)]
    );
    if (!row) return null;
    if (new Date(row.expires_at).getTime() < Date.now()) {
      await this.revoke(rawToken);
      return null;
    }
    return row.user_id;
  },

  async revoke(rawToken: string): Promise<void> {
    await db.run(`DELETE FROM refresh_tokens WHERE token_hash = ?`, [sha256(rawToken)]);
  },

  async revokeAllForUser(userId: string): Promise<void> {
    await db.run(`DELETE FROM refresh_tokens WHERE user_id = ?`, [userId]);
  },
};
