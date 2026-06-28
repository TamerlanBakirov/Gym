import { logsRepo } from '../logs/logs.repo.js';
import { profilesRepo } from '../users/users.repo.js';

const toISO = (d: Date) => d.toISOString().slice(0, 10);

/** Consecutive-day streak ending today or yesterday. */
function computeStreak(dates: string[]): number {
  const set = new Set(dates);
  let streak = 0;
  const cursor = new Date();
  if (!set.has(toISO(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!set.has(toISO(cursor))) return 0;
  }
  while (set.has(toISO(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export const statsService = {
  forUser(userId: string) {
    const totals = logsRepo.totals(userId);
    const dates = logsRepo.loggedDates(userId);
    const streak = computeStreak(dates);
    const profile = profilesRepo.get(userId);

    // Last 7 days activity buckets.
    const week: { date: string; count: number }[] = [];
    const counts: Record<string, number> = {};
    for (const d of dates) counts[d] = (counts[d] ?? 0) + 1; // distinct dates → 1 each
    const logs = logsRepo.list(userId, 500);
    const perDay: Record<string, number> = {};
    for (const l of logs) perDay[l.date] = (perDay[l.date] ?? 0) + 1;

    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = toISO(d);
      week.push({ date: key, count: perDay[key] ?? 0 });
    }

    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 6);
    const weekLogs = logs.filter((l) => new Date(l.date) >= weekStart);
    const weeklyKcal = weekLogs.reduce((s, l) => s + l.kcal, 0);
    const weeklySessions = weekLogs.length;
    const weeklyDistinctDays = new Set(weekLogs.map((l) => l.date)).size;

    return {
      totals,
      streak,
      weeklyTarget: profile?.daysPerWeek ?? 3,
      weeklyDistinctDays,
      weeklySessions,
      weeklyKcal,
      week,
    };
  },
};
