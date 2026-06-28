import { api } from './client';
import { tokenStore } from './tokens';
import type { FitnessGoal, FitnessLevel } from '../types';

export interface ApiUser {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface ApiProfile {
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
}

export interface ApiLog {
  id: string;
  workoutId: string | null;
  workoutTitle: string;
  date: string;
  durationMin: number;
  kcal: number;
  createdAt: string;
}

export interface ApiWeight {
  id: string;
  date: string;
  weightKg: number;
}

export interface ApiStats {
  totals: { count: number; kcal: number; minutes: number };
  streak: number;
  weeklyTarget: number;
  weeklyDistinctDays: number;
  weeklySessions: number;
  weeklyKcal: number;
  week: { date: string; count: number }[];
}

export interface ApiPlan {
  title: string;
  goalLabel: string;
  projectedWeeks: number;
  estimatedDailyKcal: number;
  daysPerWeek: number;
  schedule: { slug: string; title: string; durationMin: number; kcal: number; emoji: string }[];
}

type AuthResponse = {
  user: ApiUser;
  profile: ApiProfile | null;
  accessToken: string;
  refreshToken: string;
};

export const Api = {
  // --- Auth ---
  async register(email: string, password: string, name: string) {
    const res = await api<AuthResponse>('/auth/register', {
      method: 'POST',
      body: { email, password, name },
      auth: false,
    });
    await tokenStore.set(res.accessToken, res.refreshToken);
    return res;
  },

  async login(email: string, password: string) {
    const res = await api<AuthResponse>('/auth/login', {
      method: 'POST',
      body: { email, password },
      auth: false,
    });
    await tokenStore.set(res.accessToken, res.refreshToken);
    return res;
  },

  async logout() {
    const refreshToken = tokenStore.getRefresh();
    try {
      await api('/auth/logout', { method: 'POST', body: { refreshToken }, auth: false });
    } catch {
      // ignore network errors on logout
    }
    await tokenStore.clear();
  },

  me() {
    return api<{ user: ApiUser; profile: ApiProfile | null }>('/auth/me');
  },

  // --- Profile ---
  updateProfile(patch: Partial<ApiProfile>) {
    return api<{ profile: ApiProfile }>('/profile', { method: 'PUT', body: patch });
  },

  updateSettings(patch: { reminders?: boolean; units?: 'metric' | 'imperial' }) {
    return api<{ profile: ApiProfile }>('/profile/settings', { method: 'PATCH', body: patch });
  },

  // --- Plan & stats ---
  plan() {
    return api<ApiPlan>('/plan');
  },
  stats() {
    return api<ApiStats>('/stats');
  },

  // --- Logs ---
  logs() {
    return api<{ logs: ApiLog[] }>('/logs');
  },
  createLog(body: { workoutId?: string | null; workoutTitle: string; durationMin: number; kcal: number }) {
    return api<{ log: ApiLog }>('/logs', { method: 'POST', body });
  },

  // --- Weight ---
  weights() {
    return api<{ entries: ApiWeight[] }>('/progress/weight');
  },
  addWeight(weightKg: number) {
    return api<{ entry: ApiWeight }>('/progress/weight', {
      method: 'POST',
      body: { weightKg },
    });
  },
};

/** Map onboarding answers to a profile update payload. */
export type OnboardingProfilePayload = Partial<ApiProfile> & {
  goal?: FitnessGoal;
  level?: FitnessLevel;
};
