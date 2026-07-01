import { db } from '../../db/index.js';
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
  image_url: string | null;
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
  image_url: string | null;
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
  imageUrl: r.image_url,
});

async function exercisesFor(workoutId: string): Promise<Exercise[]> {
  const rows = await db.query<ExerciseRow>(
    `SELECT e.* FROM workout_exercises we
     JOIN exercises e ON e.id = we.exercise_id
     WHERE we.workout_id = ?
     ORDER BY we.position ASC`,
    [workoutId]
  );
  return rows.map(toExercise);
}

const toWorkout = async (r: WorkoutRow): Promise<Workout> => ({
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
  imageUrl: r.image_url,
  exercises: await exercisesFor(r.id),
});

export const workoutsRepo = {
  async list(muscle?: string): Promise<Workout[]> {
    const rows = muscle
      ? await db.query<WorkoutRow>(`SELECT * FROM workouts WHERE muscle = ? ORDER BY title`, [
          muscle,
        ])
      : await db.query<WorkoutRow>(`SELECT * FROM workouts ORDER BY title`);
    return Promise.all(rows.map(toWorkout));
  },

  async bySlug(slug: string): Promise<Workout | null> {
    const row = await db.one<WorkoutRow>(`SELECT * FROM workouts WHERE slug = ?`, [slug]);
    return row ? toWorkout(row) : null;
  },

  async byId(id: string): Promise<Workout | null> {
    const row = await db.one<WorkoutRow>(`SELECT * FROM workouts WHERE id = ?`, [id]);
    return row ? toWorkout(row) : null;
  },

  async listExercises(): Promise<Exercise[]> {
    const rows = await db.query<ExerciseRow>(`SELECT * FROM exercises ORDER BY name`);
    return rows.map(toExercise);
  },

  async count(): Promise<number> {
    const r = await db.one<{ c: number }>(`SELECT COUNT(*) AS c FROM workouts`);
    return r?.c ?? 0;
  },
};
