/** Domain types for the Forge fitness app. */

export type Gender = 'male' | 'female' | 'other';

export type FitnessGoal =
  | 'lose_weight'
  | 'build_muscle'
  | 'get_shredded'
  | 'stay_fit';

export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced';

export type BodyType = 'lean' | 'average' | 'heavy';

export type Equipment = 'none' | 'minimal' | 'full_gym';

export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'arms'
  | 'legs'
  | 'core'
  | 'fullbody'
  | 'cardio';

export type WorkoutLocation = 'home' | 'gym';

/** Answers collected during the onboarding quiz. */
export interface OnboardingAnswers {
  gender?: Gender;
  goal?: FitnessGoal;
  level?: FitnessLevel;
  bodyType?: BodyType;
  targetAreas?: MuscleGroup[];
  equipment?: Equipment;
  daysPerWeek?: number;
  ageRange?: string;
  heightCm?: number;
  weightKg?: number;
  targetWeightKg?: number;
}

export interface UserProfile {
  name: string;
  gender: Gender;
  goal: FitnessGoal;
  level: FitnessLevel;
  bodyType: BodyType;
  targetAreas: MuscleGroup[];
  equipment: Equipment;
  daysPerWeek: number;
  ageRange: string;
  heightCm: number;
  weightKg: number;
  targetWeightKg: number;
  createdAt: string;
}

export interface Exercise {
  id: string;
  name: string;
  muscle: MuscleGroup;
  /** seconds for timed moves, undefined for rep-based */
  durationSec?: number;
  reps?: number;
  sets: number;
  restSec: number;
  equipment: Equipment;
  /** short coaching cue */
  cue: string;
  emoji: string;
  imageUrl?: string | null;
}

export interface Workout {
  id: string;
  title: string;
  subtitle: string;
  muscle: MuscleGroup;
  level: FitnessLevel;
  durationMin: number;
  kcal: number;
  exercises: Exercise[];
  gradient: 'violet' | 'coral' | 'sky' | 'amber' | 'primary';
  emoji: string;
  imageUrl?: string | null;
}

export interface WorkoutPlan {
  id: string;
  title: string;
  description: string;
  weeks: number;
  /** workout ids per day index */
  schedule: string[];
}

/** A completed workout session log. */
export interface WorkoutLog {
  id: string;
  workoutId: string;
  workoutTitle: string;
  date: string; // ISO date
  durationMin: number;
  kcal: number;
}

/** Body-metric progress entry. */
export interface ProgressEntry {
  id: string;
  date: string; // ISO date
  weightKg: number;
}

export interface AppState {
  hasOnboarded: boolean;
  profile: UserProfile | null;
  logs: WorkoutLog[];
  weightEntries: ProgressEntry[];
  settings: {
    reminders: boolean;
    units: 'metric' | 'imperial';
  };
}
