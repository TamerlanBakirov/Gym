import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WorkoutCard } from '../../src/components/WorkoutCard';
import { useApp } from '../../src/store/AppContext';
import { MuscleGroup } from '../../src/types';
import { colors, radius, spacing, typography } from '../../src/theme';

type Filter = 'all' | MuscleGroup;

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'fullbody', label: 'Full body' },
  { key: 'chest', label: 'Upper' },
  { key: 'legs', label: 'Legs' },
  { key: 'core', label: 'Core' },
  { key: 'cardio', label: 'Cardio' },
];

export default function Workouts() {
  const router = useRouter();
  const { workouts } = useApp();
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = useMemo(() => {
    if (filter === 'all') return workouts;
    return workouts.filter((w) => w.muscle === filter);
  }, [filter, workouts]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Workouts</Text>
        <Text style={styles.subtitle}>{workouts.length} programs ready for you</Text>
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
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{f.label}</Text>
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
          <Text style={styles.empty}>No workouts in this category yet.</Text>
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
