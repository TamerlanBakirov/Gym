import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, gradients, radius, spacing, typography } from '../theme';
import { Workout } from '../types';

export function WorkoutCard({
  workout,
  onPress,
  large,
}: {
  workout: Workout;
  onPress: () => void;
  large?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }, large && styles.largeWrap]}
    >
      <LinearGradient
        colors={gradients[workout.gradient]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.card, large && styles.large]}
      >
        <View style={styles.top}>
          <Text style={styles.emoji}>{workout.emoji}</Text>
          <View style={styles.levelTag}>
            <Text style={styles.levelText}>{workout.level}</Text>
          </View>
        </View>

        <View>
          <Text style={[styles.title, large && styles.titleLarge]}>{workout.title}</Text>
          <Text style={styles.subtitle}>{workout.subtitle}</Text>
          <View style={styles.metaRow}>
            <Meta icon="time-outline" text={`${workout.durationMin} min`} />
            <Meta icon="flame-outline" text={`${workout.kcal} kcal`} />
            <Meta icon="barbell-outline" text={`${workout.exercises.length} moves`} />
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

function Meta({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.meta}>
      <Ionicons name={icon} size={14} color="rgba(11,11,15,0.75)" />
      <Text style={styles.metaText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  largeWrap: { width: '100%' },
  card: {
    borderRadius: radius.xl,
    padding: spacing.lg,
    height: 170,
    justifyContent: 'space-between',
  },
  large: { height: 210 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  emoji: { fontSize: 34 },
  levelTag: {
    backgroundColor: 'rgba(11,11,15,0.25)',
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  levelText: {
    ...typography.tiny,
    color: '#0B0B0F',
    textTransform: 'capitalize',
  },
  title: { ...typography.h2, color: '#0B0B0F' },
  titleLarge: { ...typography.h1, color: '#0B0B0F' },
  subtitle: { ...typography.caption, color: 'rgba(11,11,15,0.7)', marginTop: 2 },
  metaRow: { flexDirection: 'row', marginTop: spacing.md, gap: spacing.lg },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { ...typography.caption, color: 'rgba(11,11,15,0.8)' },
});
