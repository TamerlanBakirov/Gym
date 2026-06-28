/** Small formatting + date helpers (no external deps). */

export const todayISO = (): string => new Date().toISOString().slice(0, 10);

export const toISODate = (d: Date): string => d.toISOString().slice(0, 10);

export const dayLabel = (iso: string): string => {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString(undefined, { weekday: 'short' });
};

export const prettyDate = (iso: string): string => {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

/** Returns the ISO dates for the last `n` days, oldest first (includes today). */
export const lastNDays = (n: number): string[] => {
  const out: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    out.push(toISODate(d));
  }
  return out;
};

export const greeting = (): string => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};

export const formatDuration = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

/** Compute a current streak (consecutive days ending today/yesterday with a log). */
export const computeStreak = (loggedDates: string[]): number => {
  const set = new Set(loggedDates);
  let streak = 0;
  const cursor = new Date();
  // Allow the streak to count if today not yet trained but yesterday was.
  if (!set.has(toISODate(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!set.has(toISODate(cursor))) return 0;
  }
  while (set.has(toISODate(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
};
