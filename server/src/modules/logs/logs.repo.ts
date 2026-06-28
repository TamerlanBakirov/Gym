import { db } from '../../db/database.js';
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
  list(userId: string, limit = 100): WorkoutLog[] {
    const rows = db
      .prepare(
        `SELECT * FROM workout_logs WHERE user_id = ?
         ORDER BY date DESC, created_at DESC LIMIT ?`
      )
      .all(userId, limit) as unknown as LogRow[];
    return rows.map(toLog);
  },

  create(userId: string, input: CreateLogInput): WorkoutLog {
    const id = uid();
    const createdAt = new Date().toISOString();
    const date = input.date ?? createdAt.slice(0, 10);
    db.prepare(
      `INSERT INTO workout_logs
        (id, user_id, workout_id, workout_title, date, duration_min, kcal, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      id,
      userId,
      input.workoutId ?? null,
      input.workoutTitle,
      date,
      input.durationMin,
      input.kcal,
      createdAt
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

  remove(userId: string, id: string): boolean {
    const res = db
      .prepare(`DELETE FROM workout_logs WHERE id = ? AND user_id = ?`)
      .run(id, userId);
    return res.changes > 0;
  },

  /** All distinct logged dates for streak/aggregate computation. */
  loggedDates(userId: string): string[] {
    const rows = db
      .prepare(`SELECT DISTINCT date FROM workout_logs WHERE user_id = ? ORDER BY date DESC`)
      .all(userId) as { date: string }[];
    return rows.map((r) => r.date);
  },

  totals(userId: string): { count: number; kcal: number; minutes: number } {
    const r = db
      .prepare(
        `SELECT COUNT(*) AS count,
                COALESCE(SUM(kcal),0) AS kcal,
                COALESCE(SUM(duration_min),0) AS minutes
         FROM workout_logs WHERE user_id = ?`
      )
      .get(userId) as { count: number; kcal: number; minutes: number };
    return r;
  },
};
