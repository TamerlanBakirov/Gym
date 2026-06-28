import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Api, ApiProfile, ApiUser } from '../api';
import { setSessionExpiredHandler } from '../api/client';
import { tokenStore } from '../api/tokens';
import { ProgressEntry, UserProfile, WorkoutLog } from '../types';

/** Fill nullable API profile fields with sensible defaults for the UI. */
function normalizeProfile(api: ApiProfile | null, name: string): UserProfile {
  return {
    name,
    gender: (api?.gender as UserProfile['gender']) ?? 'other',
    goal: (api?.goal as UserProfile['goal']) ?? 'stay_fit',
    level: (api?.level as UserProfile['level']) ?? 'beginner',
    bodyType: (api?.bodyType as UserProfile['bodyType']) ?? 'average',
    targetAreas: (api?.targetAreas as UserProfile['targetAreas']) ?? ['fullbody'],
    equipment: (api?.equipment as UserProfile['equipment']) ?? 'none',
    daysPerWeek: api?.daysPerWeek ?? 3,
    ageRange: api?.ageRange ?? '18-29',
    heightCm: api?.heightCm ?? 175,
    weightKg: api?.weightKg ?? 75,
    targetWeightKg: api?.targetWeightKg ?? 72,
    createdAt: new Date().toISOString(),
  };
}

const mapLog = (l: { id: string; workoutId: string | null; workoutTitle: string; date: string; durationMin: number; kcal: number }): WorkoutLog => ({
  id: l.id,
  workoutId: l.workoutId ?? '',
  workoutTitle: l.workoutTitle,
  date: l.date,
  durationMin: l.durationMin,
  kcal: l.kcal,
});

export type ProfilePatch = Partial<ApiProfile>;

type Ctx = {
  ready: boolean;
  authenticated: boolean;
  hasOnboarded: boolean;
  user: ApiUser | null;
  profile: UserProfile | null;
  apiProfile: ApiProfile | null;
  logs: WorkoutLog[];
  weightEntries: ProgressEntry[];
  settings: { reminders: boolean; units: 'metric' | 'imperial' };
  // auth
  register: (email: string, password: string, name: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  // data
  completeOnboarding: (patch: ProfilePatch) => Promise<void>;
  updateSettings: (patch: { reminders?: boolean; units?: 'metric' | 'imperial' }) => Promise<void>;
  logWorkout: (log: { workoutId?: string | null; workoutTitle: string; durationMin: number; kcal: number }) => Promise<void>;
  addWeight: (weightKg: number) => Promise<void>;
  refresh: () => Promise<void>;
};

const AppContext = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<ApiUser | null>(null);
  const [apiProfile, setApiProfile] = useState<ApiProfile | null>(null);
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [weightEntries, setWeightEntries] = useState<ProgressEntry[]>([]);

  const clearSession = useCallback(() => {
    setUser(null);
    setApiProfile(null);
    setLogs([]);
    setWeightEntries([]);
  }, []);

  // Load logs + weights for the signed-in user.
  const loadUserData = useCallback(async () => {
    const [logsRes, weightsRes] = await Promise.all([Api.logs(), Api.weights()]);
    setLogs(logsRes.logs.map(mapLog));
    setWeightEntries(
      weightsRes.entries.map((e) => ({ id: e.id, date: e.date, weightKg: e.weightKg }))
    );
  }, []);

  // Boot: restore session from storage.
  useEffect(() => {
    setSessionExpiredHandler(() => clearSession());
    (async () => {
      try {
        await tokenStore.load();
        if (tokenStore.hasSession()) {
          const me = await Api.me();
          setUser(me.user);
          setApiProfile(me.profile);
          await loadUserData();
        }
      } catch {
        await tokenStore.clear();
        clearSession();
      } finally {
        setReady(true);
      }
    })();
  }, [clearSession, loadUserData]);

  const afterAuth = useCallback(
    async (u: ApiUser, p: ApiProfile | null) => {
      setUser(u);
      setApiProfile(p);
      await loadUserData();
    },
    [loadUserData]
  );

  const register = useCallback(
    async (email: string, password: string, name: string) => {
      const res = await Api.register(email, password, name);
      await afterAuth(res.user, res.profile);
    },
    [afterAuth]
  );

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await Api.login(email, password);
      await afterAuth(res.user, res.profile);
    },
    [afterAuth]
  );

  const logout = useCallback(async () => {
    await Api.logout();
    clearSession();
  }, [clearSession]);

  const completeOnboarding = useCallback(async (patch: ProfilePatch) => {
    const res = await Api.updateProfile({ ...patch, hasOnboarded: true });
    setApiProfile(res.profile);
  }, []);

  const updateSettings = useCallback(
    async (patch: { reminders?: boolean; units?: 'metric' | 'imperial' }) => {
      const res = await Api.updateSettings(patch);
      setApiProfile(res.profile);
    },
    []
  );

  const logWorkout = useCallback(
    async (log: { workoutId?: string | null; workoutTitle: string; durationMin: number; kcal: number }) => {
      const res = await Api.createLog(log);
      setLogs((prev) => [mapLog(res.log), ...prev]);
    },
    []
  );

  const addWeight = useCallback(async (weightKg: number) => {
    const res = await Api.addWeight(weightKg);
    setWeightEntries((prev) => {
      const rest = prev.filter((e) => e.date !== res.entry.date);
      return [...rest, { id: res.entry.id, date: res.entry.date, weightKg: res.entry.weightKg }].sort(
        (a, b) => a.date.localeCompare(b.date)
      );
    });
    setApiProfile((p) => (p ? { ...p, weightKg } : p));
  }, []);

  const refresh = useCallback(async () => {
    if (!tokenStore.hasSession()) return;
    const me = await Api.me();
    setUser(me.user);
    setApiProfile(me.profile);
    await loadUserData();
  }, [loadUserData]);

  const profile = useMemo(
    () => (user ? normalizeProfile(apiProfile, user.name) : null),
    [apiProfile, user]
  );

  const value = useMemo<Ctx>(
    () => ({
      ready,
      authenticated: !!user,
      hasOnboarded: !!apiProfile?.hasOnboarded,
      user,
      profile,
      apiProfile,
      logs,
      weightEntries,
      settings: {
        reminders: apiProfile?.reminders ?? true,
        units: apiProfile?.units ?? 'metric',
      },
      register,
      login,
      logout,
      completeOnboarding,
      updateSettings,
      logWorkout,
      addWeight,
      refresh,
    }),
    [
      ready,
      user,
      apiProfile,
      profile,
      logs,
      weightEntries,
      register,
      login,
      logout,
      completeOnboarding,
      updateSettings,
      logWorkout,
      addWeight,
      refresh,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): Ctx {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
