import { db } from '../../db/index.js';
import { uid } from '../../lib/crypto.js';
import type { WorkoutLog } from '../../types.js';

interface LogRow {
  id: string;
  workout_id: string | null;
  workout_title: string;
  date: string;
  duration_min: number;
  kcal: number;
  created_at: string;
}

const toLog = (r: LogRow): WorkoutLog => ({
  id: r.id,
  workoutId: r.workout_id,
  workoutTitle: r.workout_title,
  date: r.date,
  durationMin: r.duration_min,
  kcal: r.kcal,
  createdAt: r.created_at,
});

export interface CreateLogInput {
  workoutId?: string | null;
  workoutTitle: string;
  date?: string;
  durationMin: number;
  kcal: number;
}

export const logsRepo = {
  async list(userId: string, limit = 100): Promise<WorkoutLog[]> {
    const rows = await db.query<LogRow>(
      `SELECT * FROM workout_logs WHERE user_id = ?
       ORDER BY date DESC, created_at DESC LIMIT ?`,
      [userId, limit]
    );
    return rows.map(toLog);
  },

  async create(userId: string, input: CreateLogInput): Promise<WorkoutLog> {
    const id = uid();
    const createdAt = new Date().toISOString();
    const date = input.date ?? createdAt.slice(0, 10);
    await db.run(
      `INSERT INTO workout_logs
        (id, user_id, workout_id, workout_title, date, duration_min, kcal, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, userId, input.workoutId ?? null, input.workoutTitle, date, input.durationMin, input.kcal, createdAt]
    );
    return {
      id,
      workoutId: input.workoutId ?? null,
      workoutTitle: input.workoutTitle,
      date,
      durationMin: input.durationMin,
      kcal: input.kcal,
      createdAt,
    };
  },

  async remove(userId: string, id: string): Promise<boolean> {
    const res = await db.run(`DELETE FROM workout_logs WHERE id = ? AND user_id = ?`, [id, userId]);
    return res.changes > 0;
  },

  /** All distinct logged dates for streak/aggregate computation. */
  async loggedDates(userId: string): Promise<string[]> {
    const rows = await db.query<{ date: string }>(
      `SELECT DISTINCT date FROM workout_logs WHERE user_id = ? ORDER BY date DESC`,
      [userId]
    );
    return rows.map((r) => r.date);
  },

  async totals(userId: string): Promise<{ count: number; kcal: number; minutes: number }> {
    const r = await db.one<{ count: number; kcal: number; minutes: number }>(
      `SELECT COUNT(*) AS count,
              COALESCE(SUM(kcal),0) AS kcal,
              COALESCE(SUM(duration_min),0) AS minutes
       FROM workout_logs WHERE user_id = ?`,
      [userId]
    );
    return { count: r?.count ?? 0, kcal: r?.kcal ?? 0, minutes: r?.minutes ?? 0 };
  },
};
