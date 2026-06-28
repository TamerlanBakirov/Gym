import { workoutsRepo } from '../workouts/workouts.repo.js';
import type { Profile, Workout } from '../../types.js';

const LEVELS = ['beginner', 'intermediate', 'advanced'];

const GOAL_LABEL: Record<string, string> = {
  lose_weight: 'Lose Weight',
  build_muscle: 'Build Muscle',
  get_shredded: 'Get Shredded',
  stay_fit: 'Stay Fit',
};

export const planService = {
  goalLabel: (goal: string | null) => (goal ? GOAL_LABEL[goal] ?? 'Fitness' : 'Fitness'),

  /** Pick a weekly schedule of workouts matching the profile. */
  recommend(profile: Profile): Workout[] {
    const all = workoutsRepo.list();
    if (all.length === 0) return [];
    const targets = new Set(profile.targetAreas);
    const level = profile.level ?? 'beginner';

    const scored = all
      .map((w) => {
        let score = 0;
        if (targets.has(w.muscle)) score += 3;
        if (profile.goal === 'lose_weight' && ['cardio', 'fullbody'].includes(w.muscle))
          score += 2;
        if (profile.goal === 'build_muscle' && w.muscle !== 'cardio') score += 2;
        if (profile.goal === 'get_shredded' && ['core', 'cardio'].includes(w.muscle)) score += 2;
        const diff = Math.abs(LEVELS.indexOf(w.level) - LEVELS.indexOf(level));
        score += 2 - diff;
        return { w, score };
      })
      .sort((a, b) => b.score - a.score);

    const days = profile.daysPerWeek || 3;
    const out: Workout[] = [];
    for (let i = 0; out.length < days; i++) out.push(scored[i % scored.length].w);
    return out;
  },

  projectedWeeks(profile: Profile): number {
    const w = profile.weightKg ?? 0;
    const t = profile.targetWeightKg ?? w;
    const delta = Math.abs(w - t);
    if (profile.goal === 'build_muscle') return 12;
    if (delta === 0) return 8;
    return Math.max(6, Math.round(delta / 0.6));
  },

  estimatedDailyKcal(profile: Profile): number {
    const base = profile.gender === 'female' ? 1400 : 1700;
    const activity = 1 + (profile.daysPerWeek || 3) * 0.06;
    let kcal = base * activity;
    if (profile.goal === 'lose_weight') kcal -= 350;
    if (profile.goal === 'build_muscle') kcal += 250;
    return Math.round(kcal / 10) * 10;
  },
};
