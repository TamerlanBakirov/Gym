import { db } from '../../db/database.js';
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
  list(userId: string): WeightEntry[] {
    const rows = db
      .prepare(`SELECT id, date, weight_kg FROM weight_entries WHERE user_id = ? ORDER BY date ASC`)
      .all(userId) as unknown as WeightRow[];
    return rows.map(toEntry);
  },

  /** Upsert today's (or a given date's) weight entry. */
  upsert(userId: string, weightKg: number, date?: string): WeightEntry {
    const day = date ?? new Date().toISOString().slice(0, 10);
    const existing = db
      .prepare(`SELECT id FROM weight_entries WHERE user_id = ? AND date = ?`)
      .get(userId, day) as { id: string } | undefined;

    if (existing) {
      db.prepare(`UPDATE weight_entries SET weight_kg = ? WHERE id = ?`).run(
        weightKg,
        existing.id
      );
      return { id: existing.id, date: day, weightKg };
    }
    const id = uid();
    db.prepare(
      `INSERT INTO weight_entries (id, user_id, date, weight_kg) VALUES (?, ?, ?, ?)`
    ).run(id, userId, day, weightKg);
    return { id, date: day, weightKg };
  },
};
