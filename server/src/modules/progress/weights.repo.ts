import { db } from '../../db/index.js';
import { uid } from '../../lib/crypto.js';
import type { WeightEntry } from '../../types.js';

interface WeightRow {
  id: string;
  date: string;
  weight_kg: number;
}

const toEntry = (r: WeightRow): WeightEntry => ({
  id: r.id,
  date: r.date,
  weightKg: r.weight_kg,
});

export const weightsRepo = {
  async list(userId: string): Promise<WeightEntry[]> {
    const rows = await db.query<WeightRow>(
      `SELECT id, date, weight_kg FROM weight_entries WHERE user_id = ? ORDER BY date ASC`,
      [userId]
    );
    return rows.map(toEntry);
  },

  /** Upsert today's (or a given date's) weight entry. */
  async upsert(userId: string, weightKg: number, date?: string): Promise<WeightEntry> {
    const day = date ?? new Date().toISOString().slice(0, 10);
    const existing = await db.one<{ id: string }>(
      `SELECT id FROM weight_entries WHERE user_id = ? AND date = ?`,
      [userId, day]
    );

    if (existing) {
      await db.run(`UPDATE weight_entries SET weight_kg = ? WHERE id = ?`, [weightKg, existing.id]);
      return { id: existing.id, date: day, weightKg };
    }
    const id = uid();
    await db.run(`INSERT INTO weight_entries (id, user_id, date, weight_kg) VALUES (?, ?, ?, ?)`, [
      id,
      userId,
      day,
      weightKg,
    ]);
    return { id, date: day, weightKg };
  },
};
