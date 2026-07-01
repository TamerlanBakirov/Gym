import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { dictionaries, Locale } from './translations';

const STORAGE_KEY = 'forge:locale';

type Vars = Record<string, string | number>;

type I18nCtx = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  /** Translate a dot-path key with optional {var} interpolation. */
  t: (path: string, vars?: Vars) => string;
};

const I18nContext = createContext<I18nCtx | null>(null);

function resolve(dict: unknown, path: string): string {
  const value = path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object') return (acc as Record<string, unknown>)[key];
    return undefined;
  }, dict);
  return typeof value === 'string' ? value : path;
}

function interpolate(str: string, vars?: Vars): string {
  if (!vars) return str;
  return str.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? String(vars[k]) : `{${k}}`));
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  // Default to Turkish; overridden by a stored preference once hydrated.
  const [locale, setLocaleState] = useState<Locale>('tr');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((v) => {
        if (v === 'tr' || v === 'en') setLocaleState(v);
      })
      .catch(() => {});
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    AsyncStorage.setItem(STORAGE_KEY, l).catch(() => {});
  }, []);

  const t = useCallback(
    (path: string, vars?: Vars) => interpolate(resolve(dictionaries[locale], path), vars),
    [locale]
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nCtx {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}

export type { Locale };
