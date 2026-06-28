import { db } from '../../db/database.js';
import { uid, sha256 } from '../../lib/crypto.js';

export const tokensRepo = {
  store(userId: string, rawToken: string, expiresAt: Date): void {
    db.prepare(
      `INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at, created_at)
       VALUES (?, ?, ?, ?, ?)`
    ).run(uid(), userId, sha256(rawToken), expiresAt.toISOString(), new Date().toISOString());
  },

  /** Returns the owning userId if the token is valid and unexpired, else null. */
  resolve(rawToken: string): string | null {
    const row = db
      .prepare(`SELECT user_id, expires_at FROM refresh_tokens WHERE token_hash = ?`)
      .get(sha256(rawToken)) as { user_id: string; expires_at: string } | undefined;
    if (!row) return null;
    if (new Date(row.expires_at).getTime() < Date.now()) {
      this.revoke(rawToken);
      return null;
    }
    return row.user_id;
  },

  revoke(rawToken: string): void {
    db.prepare(`DELETE FROM refresh_tokens WHERE token_hash = ?`).run(sha256(rawToken));
  },

  revokeAllForUser(userId: string): void {
    db.prepare(`DELETE FROM refresh_tokens WHERE user_id = ?`).run(userId);
  },
};
