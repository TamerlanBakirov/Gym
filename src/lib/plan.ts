import { OnboardingAnswers, UserProfile, Workout } from '../types';
import { WORKOUTS } from '../data/workouts';

const GOAL_LABEL: Record<string, string> = {
  lose_weight: 'Lose Weight',
  build_muscle: 'Build Muscle',
  get_shredded: 'Get Shredded',
  stay_fit: 'Stay Fit',
};

/** Convert raw quiz answers into a complete profile with sensible defaults. */
export const buildProfile = (a: OnboardingAnswers, name = 'Athlete'): UserProfile => ({
  name,
  gender: a.gender ?? 'other',
  goal: a.goal ?? 'stay_fit',
  level: a.level ?? 'beginner',
  bodyType: a.bodyType ?? 'average',
  targetAreas: a.targetAreas ?? ['fullbody'],
  equipment: a.equipment ?? 'none',
  daysPerWeek: a.daysPerWeek ?? 3,
  ageRange: a.ageRange ?? '18-29',
  heightCm: a.heightCm ?? 175,
  weightKg: a.weightKg ?? 75,
  targetWeightKg: a.targetWeightKg ?? 72,
  createdAt: new Date().toISOString(),
});

/** Pick a weekly schedule of workouts that matches the user's profile. */
export const recommendSchedule = (profile: UserProfile): Workout[] => {
  const targets = new Set(profile.targetAreas);
  const scored = WORKOUTS.map((w) => {
    let score = 0;
    if (targets.has(w.muscle)) score += 3;
    if (profile.goal === 'lose_weight' && (w.muscle === 'cardio' || w.muscle === 'fullbody'))
      score += 2;
    if (profile.goal === 'build_muscle' && w.muscle !== 'cardio') score += 2;
    if (profile.goal === 'get_shredded' && (w.muscle === 'core' || w.muscle === 'cardio'))
      score += 2;
    // level proximity
    const levels = ['beginner', 'intermediate', 'advanced'];
    const diff = Math.abs(levels.indexOf(w.level) - levels.indexOf(profile.level));
    score += 2 - diff;
    return { w, score };
  }).sort((a, b) => b.score - a.score);

  const days = profile.daysPerWeek;
  const out: Workout[] = [];
  let i = 0;
  while (out.length < days) {
    out.push(scored[i % scored.length].w);
    i++;
  }
  return out;
};

export const planTitle = (profile: UserProfile): string =>
  `Your ${GOAL_LABEL[profile.goal]} Plan`;

/** Rough projected timeline in weeks based on weight delta + goal. */
export const projectedWeeks = (profile: UserProfile): number => {
  const delta = Math.abs(profile.weightKg - profile.targetWeightKg);
  if (profile.goal === 'build_muscle') return 12;
  if (delta === 0) return 8;
  return Math.max(6, Math.round(delta / 0.6)); // ~0.6kg/week
};

export const goalLabel = (goal: string): string => GOAL_LABEL[goal] ?? 'Fitness';

/** Estimated daily calorie target (very rough Harris-Benedict-ish). */
export const estimatedDailyKcal = (profile: UserProfile): number => {
  const base = profile.gender === 'female' ? 1400 : 1700;
  const activity = 1 + profile.daysPerWeek * 0.06;
  let kcal = base * activity;
  if (profile.goal === 'lose_weight') kcal -= 350;
  if (profile.goal === 'build_muscle') kcal += 250;
  return Math.round(kcal / 10) * 10;
};
