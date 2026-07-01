import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WorkoutCard } from '../../src/components/WorkoutCard';
import { useApp } from '../../src/store/AppContext';
import { useI18n } from '../../src/i18n';
import { MuscleGroup } from '../../src/types';
import { colors, radius, spacing, typography } from '../../src/theme';

type Filter = 'all' | MuscleGroup;

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'workouts.all' },
  { key: 'fullbody', label: 'workouts.fullbody' },
  { key: 'chest', label: 'workouts.upper' },
  { key: 'legs', label: 'workouts.legs' },
  { key: 'core', label: 'workouts.core' },
  { key: 'cardio', label: 'workouts.cardio' },
];

export default function Workouts() {
  const router = useRouter();
  const { workouts } = useApp();
  const { t } = useI18n();
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = useMemo(() => {
    if (filter === 'all') return workouts;
    return workouts.filter((w) => w.muscle === filter);
  }, [filter, workouts]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('workouts.title')}</Text>
        <Text style={styles.subtitle}>{t('workouts.subtitle', { n: workouts.length })}</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
        style={styles.filtersWrap}
      >
        {FILTERS.map((f) => {
          const active = f.key === filter;
          return (
            <Pressable
              key={f.key}
              onPress={() => setFilter(f.key)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{t(f.label)}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        {filtered.map((w) => (
          <WorkoutCard
            key={w.id}
            workout={w}
            large
            onPress={() => router.push(`/workout/${w.id}`)}
          />
        ))}
        {filtered.length === 0 ? (
          <Text style={styles.empty}>{t('workouts.empty')}</Text>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  title: { ...typography.display, color: colors.text },
  subtitle: { ...typography.body, color: colors.textMuted, marginTop: 2 },
  filtersWrap: { maxHeight: 60, marginTop: spacing.md },
  filters: { paddingHorizontal: spacing.lg, gap: spacing.sm, alignItems: 'center' },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    height: 38,
    justifyContent: 'center',
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { ...typography.caption, color: colors.textMuted },
  chipTextActive: { color: colors.primaryText },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.lg, paddingTop: spacing.sm },
  empty: { ...typography.body, color: colors.textMuted, textAlign: 'center', marginTop: spacing.xxl },
});
