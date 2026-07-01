import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Eyebrow, ProgressBar } from '../../src/components/ui';
import { WorkoutCard } from '../../src/components/WorkoutCard';
import { useApp } from '../../src/store/AppContext';
import { useI18n } from '../../src/i18n';
import { computeStreak, todayISO } from '../../src/lib/format';
import { recommendSchedule } from '../../src/lib/plan';
import { colors, radius, spacing, typography } from '../../src/theme';

export default function Today() {
  const router = useRouter();
  const { profile, logs, workouts } = useApp();
  const { t } = useI18n();
  const safeProfile = profile!;
  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? t('today.greetingMorning')
      : hour < 18
        ? t('today.greetingAfternoon')
        : t('today.greetingEvening');

  const schedule = useMemo(
    () => recommendSchedule(safeProfile, workouts),
    [safeProfile, workouts]
  );
  const todaysWorkout = useMemo(() => {
    const dow = new Date().getDay();
    return schedule[dow % schedule.length];
  }, [schedule]);

  const loggedDates = logs.map((l) => l.date);
  const streak = computeStreak(loggedDates);
  const doneToday = loggedDates.includes(todayISO());

  const weekLogs = useMemo(() => {
    const start = new Date();
    start.setDate(start.getDate() - 6);
    return logs.filter((l) => new Date(l.date) >= start);
  }, [logs]);

  const weeklyTarget = safeProfile.daysPerWeek;
  const weeklyDone = new Set(weekLogs.map((l) => l.date)).size;
  const kcalWeek = weekLogs.reduce((sum, l) => sum + l.kcal, 0);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>{greeting},</Text>
            <Text style={styles.name}>{safeProfile.name} 👋</Text>
          </View>
          <View style={styles.streakChip}>
            <Ionicons name="flame" size={16} color={colors.primary} />
            <Text style={styles.streakText}>{streak}</Text>
          </View>
        </View>

        {/* Weekly goal */}
        <Card style={styles.goalCard}>
          <View style={styles.goalHeader}>
            <Eyebrow>{t('today.thisWeek')}</Eyebrow>
            <Text style={styles.goalCount}>
              {t('today.workoutsCount', { done: weeklyDone, target: weeklyTarget })}
            </Text>
          </View>
          <ProgressBar progress={weeklyTarget ? weeklyDone / weeklyTarget : 0} />
          <View style={styles.goalStats}>
            <MiniStat label={t('today.sessions')} value={`${weekLogs.length}`} />
            <View style={styles.divider} />
            <MiniStat label={t('today.calories')} value={`${kcalWeek}`} />
            <View style={styles.divider} />
            <MiniStat label={t('today.streak')} value={`${streak}d`} />
          </View>
        </Card>

        {/* Today's workout */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('today.todaysWorkout')}</Text>
          {doneToday ? (
            <View style={styles.doneTag}>
              <Ionicons name="checkmark-circle" size={14} color={colors.success} />
              <Text style={styles.doneText}>{t('today.doneTag')}</Text>
            </View>
          ) : null}
        </View>

        <WorkoutCard
          workout={todaysWorkout}
          large
          onPress={() => router.push(`/workout/${todaysWorkout.id}`)}
        />

        {/* Quick actions */}
        <View style={styles.quickRow}>
          <QuickAction
            icon="list"
            label={t('today.allWorkouts')}
            onPress={() => router.push('/(tabs)/workouts')}
          />
          <QuickAction
            icon="trending-up"
            label={t('today.logWeight')}
            onPress={() => router.push('/(tabs)/progress')}
          />
        </View>

        {/* Up next */}
        <Text style={[styles.sectionTitle, { marginTop: spacing.xl }]}>{t('today.upNext')}</Text>
        <View style={styles.upNext}>
          {schedule.slice(1, 4).map((w, i) => (
            <Pressable
              key={`${w.id}-${i}`}
              onPress={() => router.push(`/workout/${w.id}`)}
              style={styles.upNextRow}
            >
              <Text style={styles.upNextEmoji}>{w.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.upNextTitle}>{w.title}</Text>
                <Text style={styles.upNextMeta}>
                  {w.durationMin} {t('common.min')} · {w.kcal} kcal
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textFaint} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.miniStat}>
      <Text style={styles.miniValue}>{value}</Text>
      <Text style={styles.miniLabel}>{label}</Text>
    </View>
  );
}

function QuickAction({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.quickAction}>
      <View style={styles.quickIcon}>
        <Ionicons name={icon} size={20} color={colors.primary} />
      </View>
      <Text style={styles.quickLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, paddingTop: spacing.sm },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  greeting: { ...typography.body, color: colors.textMuted },
  name: { ...typography.h1, color: colors.text },
  streakChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  streakText: { ...typography.h3, color: colors.text },
  goalCard: { marginBottom: spacing.xl },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  goalCount: { ...typography.caption, color: colors.text },
  goalStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  miniStat: { flex: 1, alignItems: 'center' },
  miniValue: { ...typography.h3, color: colors.text },
  miniLabel: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  divider: { width: 1, height: 28, backgroundColor: colors.border },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: { ...typography.h2, color: colors.text },
  doneTag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  doneText: { ...typography.caption, color: colors.success },
  quickRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
  quickAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: { ...typography.body, color: colors.text, flexShrink: 1 },
  upNext: { gap: spacing.sm, marginTop: spacing.md },
  upNextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  upNextEmoji: { fontSize: 26 },
  upNextTitle: { ...typography.h3, color: colors.text },
  upNextMeta: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
});
