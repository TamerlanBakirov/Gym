import { db } from '../../db/database.js';
import type { Exercise, Workout } from '../../types.js';

interface ExerciseRow {
  id: string;
  slug: string;
  name: string;
  muscle: string;
  duration_sec: number | null;
  reps: number | null;
  sets: number;
  rest_sec: number;
  equipment: string;
  cue: string;
  emoji: string;
}

interface WorkoutRow {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  muscle: string;
  level: string;
  duration_min: number;
  kcal: number;
  gradient: string;
  emoji: string;
}

const toExercise = (r: ExerciseRow): Exercise => ({
  id: r.id,
  slug: r.slug,
  name: r.name,
  muscle: r.muscle,
  durationSec: r.duration_sec,
  reps: r.reps,
  sets: r.sets,
  restSec: r.rest_sec,
  equipment: r.equipment,
  cue: r.cue,
  emoji: r.emoji,
});

function exercisesFor(workoutId: string): Exercise[] {
  const rows = db
    .prepare(
      `SELECT e.* FROM workout_exercises we
       JOIN exercises e ON e.id = we.exercise_id
       WHERE we.workout_id = ?
       ORDER BY we.position ASC`
    )
    .all(workoutId) as unknown as ExerciseRow[];
  return rows.map(toExercise);
}

const toWorkout = (r: WorkoutRow): Workout => ({
  id: r.id,
  slug: r.slug,
  title: r.title,
  subtitle: r.subtitle,
  muscle: r.muscle,
  level: r.level,
  durationMin: r.duration_min,
  kcal: r.kcal,
  gradient: r.gradient,
  emoji: r.emoji,
  exercises: exercisesFor(r.id),
});

export const workoutsRepo = {
  list(muscle?: string): Workout[] {
    const rows = (
      muscle
        ? db.prepare(`SELECT * FROM workouts WHERE muscle = ? ORDER BY title`).all(muscle)
        : db.prepare(`SELECT * FROM workouts ORDER BY title`).all()
    ) as unknown as WorkoutRow[];
    return rows.map(toWorkout);
  },

  bySlug(slug: string): Workout | null {
    const row = db.prepare(`SELECT * FROM workouts WHERE slug = ?`).get(slug) as
      | WorkoutRow
      | undefined;
    return row ? toWorkout(row) : null;
  },

  byId(id: string): Workout | null {
    const row = db.prepare(`SELECT * FROM workouts WHERE id = ?`).get(id) as
      | WorkoutRow
      | undefined;
    return row ? toWorkout(row) : null;
  },

  listExercises(): Exercise[] {
    const rows = db
      .prepare(`SELECT * FROM exercises ORDER BY name`)
      .all() as unknown as ExerciseRow[];
    return rows.map(toExercise);
  },

  count(): number {
    const r = db.prepare(`SELECT COUNT(*) AS c FROM workouts`).get() as { c: number };
    return r.c;
  },
};
