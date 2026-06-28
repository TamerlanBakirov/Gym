import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../src/components/Button';
import { Card, GradientCard } from '../../src/components/ui';
import { useApp } from '../../src/store/AppContext';
import { OnboardingAnswers } from '../../src/types';
import {
  buildProfile,
  estimatedDailyKcal,
  goalLabel,
  planTitle,
  projectedWeeks,
  recommendSchedule,
} from '../../src/lib/plan';
import { colors, radius, spacing, typography } from '../../src/theme';

export default function PlanReveal() {
  const router = useRouter();
  const { completeOnboarding } = useApp();
  const { answers } = useLocalSearchParams<{ answers: string }>();

  const parsed: OnboardingAnswers = useMemo(() => {
    try {
      return JSON.parse(answers ?? '{}');
    } catch {
      return {};
    }
  }, [answers]);

  const profile = useMemo(() => buildProfile(parsed), [parsed]);
  const schedule = useMemo(() => recommendSchedule(profile), [profile]);
  const weeks = projectedWeeks(profile);
  const kcal = estimatedDailyKcal(profile);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = async () => {
    setError(null);
    setSaving(true);
    try {
      await completeOnboarding({
        gender: profile.gender,
        goal: profile.goal,
        level: profile.level,
        bodyType: profile.bodyType,
        targetAreas: profile.targetAreas,
        equipment: profile.equipment,
        daysPerWeek: profile.daysPerWeek,
        ageRange: profile.ageRange,
        heightCm: profile.heightCm,
        weightKg: profile.weightKg,
        targetWeightKg: profile.targetWeightKg,
      });
      router.replace('/(tabs)');
    } catch {
      setError('Could not save your plan. Please check your connection and try again.');
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.badge}>
          <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
          <Text style={styles.badgeText}>Your plan is ready</Text>
        </View>

        <Text style={styles.title}>{planTitle(profile)}</Text>
        <Text style={styles.subtitle}>
          Built for a {profile.level} focused on {goalLabel(profile.goal).toLowerCase()},
          {' '}training {profile.daysPerWeek} days a week.
        </Text>

        <GradientCard gradient="primary" style={styles.hero}>
          <Text style={styles.heroLabel}>ESTIMATED TIME TO GOAL</Text>
          <Text style={styles.heroValue}>{weeks} weeks</Text>
          <Text style={styles.heroSub}>Stay consistent and you'll feel it sooner.</Text>
        </GradientCard>

        <View style={styles.statsRow}>
          <Stat icon="flame" value={`${kcal}`} label="kcal / day" />
          <Stat icon="calendar" value={`${profile.daysPerWeek}x`} label="per week" />
          <Stat icon="barbell" value={`${schedule.length}`} label="workouts" />
        </View>

        <Text style={styles.sectionTitle}>Your weekly split</Text>
        <View style={styles.list}>
          {schedule.map((w, i) => (
            <Card key={`${w.id}-${i}`} style={styles.dayRow}>
              <View style={styles.dayBadge}>
                <Text style={styles.dayBadgeText}>D{i + 1}</Text>
              </View>
              <Text style={styles.dayEmoji}>{w.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.dayTitle}>{w.title}</Text>
                <Text style={styles.dayMeta}>
                  {w.durationMin} min · {w.exercises.length} exercises
                </Text>
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button label="Start my journey" onPress={start} loading={saving} />
      </View>
    </SafeAreaView>
  );
}

function Stat({
  icon,
  value,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
}) {
  return (
    <View style={styles.stat}>
      <Ionicons name={icon} size={20} color={colors.primary} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: spacing.lg },
  content: { paddingTop: spacing.lg, paddingBottom: spacing.xxl },
  badge: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  badgeText: { ...typography.caption, color: colors.primary, textTransform: 'uppercase', letterSpacing: 1 },
  title: { ...typography.display, color: colors.text },
  subtitle: { ...typography.body, color: colors.textMuted, marginTop: spacing.sm, lineHeight: 22 },
  hero: { marginTop: spacing.xl },
  heroLabel: { ...typography.tiny, color: 'rgba(11,11,15,0.7)', letterSpacing: 1 },
  heroValue: { fontSize: 40, fontWeight: '800', color: colors.primaryText, marginTop: 4 },
  heroSub: { ...typography.caption, color: 'rgba(11,11,15,0.75)', marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  stat: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: { ...typography.h2, color: colors.text, marginTop: spacing.sm },
  statLabel: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  sectionTitle: { ...typography.h2, color: colors.text, marginTop: spacing.xl, marginBottom: spacing.md },
  list: { gap: spacing.md },
  dayRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  dayBadge: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayBadgeText: { ...typography.caption, color: colors.primary },
  dayEmoji: { fontSize: 26 },
  dayTitle: { ...typography.h3, color: colors.text },
  dayMeta: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  footer: { paddingBottom: spacing.md, paddingTop: spacing.sm },
  error: { ...typography.caption, color: colors.danger, textAlign: 'center', marginBottom: spacing.sm },
});
