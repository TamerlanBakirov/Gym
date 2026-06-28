import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../src/components/Button';
import { getWorkout } from '../../src/data/workouts';
import { colors, gradients, radius, spacing, typography } from '../../src/theme';

export default function WorkoutDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const workout = getWorkout(id ?? '');

  if (!workout) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.notFound}>Workout not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.root}>
      <LinearGradient colors={gradients[workout.gradient]} style={styles.hero}>
        <SafeAreaView edges={['top']} style={styles.heroInner}>
          <Pressable onPress={() => router.back()} hitSlop={12} style={styles.closeBtn}>
            <Ionicons name="chevron-down" size={26} color="#0B0B0F" />
          </Pressable>
          <Text style={styles.heroEmoji}>{workout.emoji}</Text>
          <Text style={styles.heroTitle}>{workout.title}</Text>
          <Text style={styles.heroSub}>{workout.subtitle}</Text>
          <View style={styles.heroMeta}>
            <HeroMeta icon="time" text={`${workout.durationMin} min`} />
            <HeroMeta icon="flame" text={`${workout.kcal} kcal`} />
            <HeroMeta icon="barbell" text={`${workout.exercises.length} moves`} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        style={styles.scroll}
      >
        <Text style={styles.sectionTitle}>Exercises</Text>
        {workout.exercises.map((ex, i) => (
          <View key={`${ex.id}-${i}`} style={styles.exRow}>
            <Text style={styles.exIndex}>{String(i + 1).padStart(2, '0')}</Text>
            <Text style={styles.exEmoji}>{ex.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.exName}>{ex.name}</Text>
              <Text style={styles.exMeta}>
                {ex.sets} sets ·{' '}
                {ex.durationSec ? `${ex.durationSec}s` : `${ex.reps} reps`} · {ex.restSec}s rest
              </Text>
            </View>
          </View>
        ))}
        <View style={styles.spacer} />
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={styles.footer}>
        <Button
          label="Start workout"
          icon={<Ionicons name="play" size={18} color={colors.primaryText} />}
          onPress={() =>
            router.push({ pathname: '/workout/session', params: { id: workout.id } })
          }
        />
      </SafeAreaView>
    </View>
  );
}

function HeroMeta({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.heroMetaItem}>
      <Ionicons name={icon} size={16} color="rgba(11,11,15,0.8)" />
      <Text style={styles.heroMetaText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  safe: { flex: 1, backgroundColor: colors.bg, justifyContent: 'center' },
  notFound: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
  hero: { borderBottomLeftRadius: radius.xl, borderBottomRightRadius: radius.xl },
  heroInner: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(11,11,15,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  heroEmoji: { fontSize: 56, marginTop: spacing.lg },
  heroTitle: { ...typography.display, color: '#0B0B0F', marginTop: spacing.sm },
  heroSub: { ...typography.body, color: 'rgba(11,11,15,0.75)', marginTop: 2 },
  heroMeta: { flexDirection: 'row', gap: spacing.xl, marginTop: spacing.lg },
  heroMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  heroMetaText: { ...typography.caption, color: '#0B0B0F' },
  scroll: { flex: 1 },
  content: { padding: spacing.lg },
  sectionTitle: { ...typography.h2, color: colors.text, marginBottom: spacing.md },
  exRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  exIndex: { ...typography.caption, color: colors.textFaint, width: 24 },
  exEmoji: { fontSize: 28 },
  exName: { ...typography.h3, color: colors.text },
  exMeta: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  spacer: { height: spacing.xl },
  footer: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
});
