/** Shared API/domain types for the Forge backend. */

export interface User {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  createdAt: string;
}

export interface Profile {
  gender: string | null;
  goal: string | null;
  level: string | null;
  bodyType: string | null;
  targetAreas: string[];
  equipment: string | null;
  daysPerWeek: number;
  ageRange: string | null;
  heightCm: number | null;
  weightKg: number | null;
  targetWeightKg: number | null;
  hasOnboarded: boolean;
  reminders: boolean;
  units: 'metric' | 'imperial';
  expoPushToken: string | null;
}

export interface Exercise {
  id: string;
  slug: string;
  name: string;
  muscle: string;
  durationSec: number | null;
  reps: number | null;
  sets: number;
  restSec: number;
  equipment: string;
  cue: string;
  emoji: string;
  imageUrl: string | null;
}

export interface Workout {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  muscle: string;
  level: string;
  durationMin: number;
  kcal: number;
  gradient: string;
  emoji: string;
  imageUrl: string | null;
  exercises: Exercise[];
}

export interface WorkoutLog {
  id: string;
  workoutId: string | null;
  workoutTitle: string;
  date: string;
  durationMin: number;
  kcal: number;
  createdAt: string;
}

export interface WeightEntry {
  id: string;
  date: string;
  weightKg: number;
}
