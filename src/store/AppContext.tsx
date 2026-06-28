import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { AppState, ProgressEntry, UserProfile, WorkoutLog } from '../types';
import { todayISO } from '../lib/format';

const STORAGE_KEY = 'forge:appstate:v1';

const initialState: AppState = {
  hasOnboarded: false,
  profile: null,
  logs: [],
  weightEntries: [],
  settings: { reminders: true, units: 'metric' },
};

type Ctx = {
  state: AppState;
  ready: boolean;
  completeOnboarding: (profile: UserProfile) => void;
  logWorkout: (log: Omit<WorkoutLog, 'id' | 'date'>) => void;
  addWeight: (weightKg: number) => void;
  updateProfile: (patch: Partial<UserProfile>) => void;
  updateSettings: (patch: Partial<AppState['settings']>) => void;
  resetAll: () => void;
};

const AppContext = createContext<Ctx | null>(null);

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);
  const [ready, setReady] = useState(false);

  // Hydrate from storage once.
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setState({ ...initialState, ...JSON.parse(raw) });
      } catch (err) {
        console.warn('Failed to load app state', err);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  // Persist on every change (after hydration).
  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch((err) =>
      console.warn('Failed to save app state', err)
    );
  }, [state, ready]);

  const completeOnboarding = useCallback((profile: UserProfile) => {
    setState((s) => ({
      ...s,
      hasOnboarded: true,
      profile,
      weightEntries:
        s.weightEntries.length === 0
          ? [{ id: uid(), date: todayISO(), weightKg: profile.weightKg }]
          : s.weightEntries,
    }));
  }, []);

  const logWorkout = useCallback((log: Omit<WorkoutLog, 'id' | 'date'>) => {
    setState((s) => ({
      ...s,
      logs: [{ ...log, id: uid(), date: todayISO() }, ...s.logs],
    }));
  }, []);

  const addWeight = useCallback((weightKg: number) => {
    setState((s) => {
      const date = todayISO();
      const entry: ProgressEntry = { id: uid(), date, weightKg };
      // Replace today's entry if it exists.
      const rest = s.weightEntries.filter((e) => e.date !== date);
      const weightEntries = [...rest, entry].sort((a, b) => a.date.localeCompare(b.date));
      return {
        ...s,
        weightEntries,
        profile: s.profile ? { ...s.profile, weightKg } : s.profile,
      };
    });
  }, []);

  const updateProfile = useCallback((patch: Partial<UserProfile>) => {
    setState((s) => ({ ...s, profile: s.profile ? { ...s.profile, ...patch } : s.profile }));
  }, []);

  const updateSettings = useCallback((patch: Partial<AppState['settings']>) => {
    setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
  }, []);

  const resetAll = useCallback(() => setState(initialState), []);

  const value = useMemo(
    () => ({
      state,
      ready,
      completeOnboarding,
      logWorkout,
      addWeight,
      updateProfile,
      updateSettings,
      resetAll,
    }),
    [state, ready, completeOnboarding, logWorkout, addWeight, updateProfile, updateSettings, resetAll]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): Ctx {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
