import { db, migrate } from './database.js';
import { uid } from '../lib/crypto.js';

interface SeedExercise {
  slug: string;
  name: string;
  muscle: string;
  durationSec?: number;
  reps?: number;
  sets: number;
  restSec: number;
  equipment: string;
  cue: string;
  emoji: string;
}

const EXERCISES: SeedExercise[] = [
  { slug: 'pushup', name: 'Push-ups', muscle: 'chest', reps: 12, sets: 3, restSec: 45, equipment: 'none', cue: 'Keep your core tight and elbows at 45°.', emoji: '🅿️' },
  { slug: 'inclinePushup', name: 'Incline Push-ups', muscle: 'chest', reps: 12, sets: 3, restSec: 40, equipment: 'none', cue: 'Hands on a raised surface to scale difficulty.', emoji: '📐' },
  { slug: 'pullup', name: 'Pull-ups', muscle: 'back', reps: 8, sets: 3, restSec: 60, equipment: 'minimal', cue: 'Pull your chest to the bar, no swinging.', emoji: '🏋️' },
  { slug: 'invertedRow', name: 'Inverted Rows', muscle: 'back', reps: 12, sets: 3, restSec: 45, equipment: 'minimal', cue: 'Squeeze your shoulder blades at the top.', emoji: '↩️' },
  { slug: 'squat', name: 'Bodyweight Squats', muscle: 'legs', reps: 20, sets: 3, restSec: 45, equipment: 'none', cue: 'Drive through your heels, chest up.', emoji: '🦵' },
  { slug: 'lunge', name: 'Walking Lunges', muscle: 'legs', reps: 16, sets: 3, restSec: 45, equipment: 'none', cue: 'Step long, knee tracks over the toe.', emoji: '🚶' },
  { slug: 'gluteBridge', name: 'Glute Bridges', muscle: 'legs', reps: 18, sets: 3, restSec: 40, equipment: 'none', cue: 'Squeeze glutes hard at the top.', emoji: '🌉' },
  { slug: 'pike', name: 'Pike Push-ups', muscle: 'shoulders', reps: 10, sets: 3, restSec: 50, equipment: 'none', cue: 'Hips high, lower the crown of your head.', emoji: '🔺' },
  { slug: 'dip', name: 'Bench Dips', muscle: 'arms', reps: 14, sets: 3, restSec: 45, equipment: 'minimal', cue: 'Keep elbows tucked, lower under control.', emoji: '💪' },
  { slug: 'chinup', name: 'Chin-ups', muscle: 'arms', reps: 8, sets: 3, restSec: 60, equipment: 'minimal', cue: 'Underhand grip, lead with the chest.', emoji: '🆙' },
  { slug: 'plank', name: 'Plank', muscle: 'core', durationSec: 45, sets: 3, restSec: 30, equipment: 'none', cue: 'Straight line from head to heels.', emoji: '🧱' },
  { slug: 'hollowHold', name: 'Hollow Hold', muscle: 'core', durationSec: 30, sets: 3, restSec: 30, equipment: 'none', cue: 'Lower back pressed into the floor.', emoji: '🛶' },
  { slug: 'legRaise', name: 'Leg Raises', muscle: 'core', reps: 14, sets: 3, restSec: 35, equipment: 'none', cue: 'Control the lowering, no momentum.', emoji: '⬆️' },
  { slug: 'mountainClimber', name: 'Mountain Climbers', muscle: 'cardio', durationSec: 40, sets: 3, restSec: 25, equipment: 'none', cue: 'Fast knees, hips stay low.', emoji: '⛰️' },
  { slug: 'burpee', name: 'Burpees', muscle: 'cardio', reps: 12, sets: 3, restSec: 40, equipment: 'none', cue: 'Explode up, soft landing.', emoji: '🔥' },
  { slug: 'jumpingJack', name: 'Jumping Jacks', muscle: 'cardio', durationSec: 45, sets: 3, restSec: 20, equipment: 'none', cue: 'Stay light on the balls of your feet.', emoji: '🤸' },
  { slug: 'highKnees', name: 'High Knees', muscle: 'cardio', durationSec: 40, sets: 3, restSec: 25, equipment: 'none', cue: 'Drive knees to hip height.', emoji: '🏃' },
];

interface SeedWorkout {
  slug: string;
  title: string;
  subtitle: string;
  muscle: string;
  level: string;
  durationMin: number;
  kcal: number;
  gradient: string;
  emoji: string;
  exercises: string[]; // exercise slugs in order
}

const WORKOUTS: SeedWorkout[] = [
  { slug: 'full-body-burn', title: 'Full Body Burn', subtitle: 'Total-body conditioning', muscle: 'fullbody', level: 'beginner', durationMin: 24, kcal: 240, gradient: 'primary', emoji: '🔥', exercises: ['jumpingJack', 'squat', 'pushup', 'plank', 'lunge', 'mountainClimber'] },
  { slug: 'upper-power', title: 'Upper Power', subtitle: 'Chest, back & arms', muscle: 'chest', level: 'intermediate', durationMin: 28, kcal: 280, gradient: 'violet', emoji: '💪', exercises: ['pushup', 'pullup', 'dip', 'invertedRow', 'pike', 'chinup'] },
  { slug: 'core-crusher', title: 'Core Crusher', subtitle: 'Carve your abs', muscle: 'core', level: 'beginner', durationMin: 18, kcal: 170, gradient: 'sky', emoji: '🧱', exercises: ['plank', 'hollowHold', 'legRaise', 'mountainClimber', 'highKnees'] },
  { slug: 'leg-day', title: 'Leg Day', subtitle: 'Quads, glutes & hamstrings', muscle: 'legs', level: 'intermediate', durationMin: 26, kcal: 260, gradient: 'amber', emoji: '🦵', exercises: ['squat', 'lunge', 'gluteBridge', 'highKnees', 'plank'] },
  { slug: 'hiit-shred', title: 'HIIT Shred', subtitle: 'Max calorie burn', muscle: 'cardio', level: 'advanced', durationMin: 22, kcal: 320, gradient: 'coral', emoji: '⚡', exercises: ['burpee', 'mountainClimber', 'jumpingJack', 'highKnees', 'squat', 'pushup'] },
  { slug: 'morning-flow', title: 'Morning Flow', subtitle: 'Wake up & mobilize', muscle: 'fullbody', level: 'beginner', durationMin: 14, kcal: 110, gradient: 'sky', emoji: '🌅', exercises: ['jumpingJack', 'gluteBridge', 'inclinePushup', 'plank'] },
];

/** Seed catalog data. Idempotent: clears and repopulates exercises/workouts. */
export function seed(): void {
  const exIds = new Map<string, string>();

  const insertExercise = db.prepare(
    `INSERT INTO exercises (id, slug, name, muscle, duration_sec, reps, sets, rest_sec, equipment, cue, emoji)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const insertWorkout = db.prepare(
    `INSERT INTO workouts (id, slug, title, subtitle, muscle, level, duration_min, kcal, gradient, emoji)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const insertLink = db.prepare(
    `INSERT INTO workout_exercises (workout_id, exercise_id, position) VALUES (?, ?, ?)`
  );

  db.exec('DELETE FROM workout_exercises; DELETE FROM workouts; DELETE FROM exercises;');

  for (const e of EXERCISES) {
    const id = uid();
    exIds.set(e.slug, id);
    insertExercise.run(
      id, e.slug, e.name, e.muscle,
      e.durationSec ?? null, e.reps ?? null, e.sets, e.restSec,
      e.equipment, e.cue, e.emoji
    );
  }

  for (const w of WORKOUTS) {
    const id = uid();
    insertWorkout.run(
      id, w.slug, w.title, w.subtitle, w.muscle, w.level,
      w.durationMin, w.kcal, w.gradient, w.emoji
    );
    w.exercises.forEach((slug, position) => {
      const exId = exIds.get(slug);
      if (exId) insertLink.run(id, exId, position);
    });
  }

  console.log(`✅ Seeded ${EXERCISES.length} exercises and ${WORKOUTS.length} workouts.`);
}

/** Seed only if the catalog is empty (called on server boot). */
export function ensureSeeded(): void {
  const row = db.prepare('SELECT COUNT(*) AS c FROM workouts').get() as { c: number };
  if (row.c === 0) seed();
}

// Allow running directly: `npm run seed`
if (import.meta.url === `file://${process.argv[1]}`) {
  migrate();
  seed();
  process.exit(0);
}
