import AsyncStorage from '@react-native-async-storage/async-storage';
import { Api, ApiExercise, ApiWorkout } from '../api';
import { WORKOUTS as BUNDLED } from '../data/workouts';
import { Equipment, Exercise, MuscleGroup, Workout } from '../types';

const CACHE_KEY = 'forge:catalog:v1';

const mapExercise = (e: ApiExercise): Exercise => ({
  id: e.slug || e.id,
  name: e.name,
  muscle: e.muscle as MuscleGroup,
  durationSec: e.durationSec ?? undefined,
  reps: e.reps ?? undefined,
  sets: e.sets,
  restSec: e.restSec,
  equipment: e.equipment as Equipment,
  cue: e.cue,
  emoji: e.emoji,
  imageUrl: e.imageUrl,
});

export const mapWorkout = (w: ApiWorkout): Workout => ({
  id: w.slug || w.id,
  title: w.title,
  subtitle: w.subtitle,
  muscle: w.muscle as MuscleGroup,
  level: w.level as Workout['level'],
  durationMin: w.durationMin,
  kcal: w.kcal,
  gradient: w.gradient as Workout['gradient'],
  emoji: w.emoji,
  imageUrl: w.imageUrl,
  exercises: w.exercises.map(mapExercise),
});

/**
 * Load the workout catalog. Tries the backend first (and caches it), falling
 * back to the last cached copy and finally the bundled catalog when offline.
 */
export async function loadCatalog(): Promise<Workout[]> {
  try {
    const { workouts } = await Api.workouts();
    if (workouts?.length) {
      const mapped = workouts.map(mapWorkout);
      AsyncStorage.setItem(CACHE_KEY, JSON.stringify(mapped)).catch(() => {});
      return mapped;
    }
  } catch {
    // fall through to cache / bundled
  }
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (raw) return JSON.parse(raw) as Workout[];
  } catch {
    // ignore
  }
  return BUNDLED;
}
