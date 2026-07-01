import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
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
  const [imgError, setImgError] = useState(false);
  const showImage = !!workout.imageUrl && !imgError;
  // Dark text works on the bright color gradient; light text on the photo overlay.
  const ink = showImage ? '#FFFFFF' : '#0B0B0F';
  const inkDim = showImage ? 'rgba(255,255,255,0.85)' : 'rgba(11,11,15,0.75)';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }, large && styles.largeWrap]}
    >
      <View style={[styles.card, large && styles.large]}>
        {showImage ? (
          <>
            <Image
              source={{ uri: workout.imageUrl! }}
              style={StyleSheet.absoluteFill}
              onError={() => setImgError(true)}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['rgba(11,11,15,0.15)', 'rgba(11,11,15,0.85)']}
              style={StyleSheet.absoluteFill}
            />
          </>
        ) : (
          <LinearGradient
            colors={gradients[workout.gradient]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        )}

        <View style={styles.inner}>
          <View style={styles.top}>
            <Text style={styles.emoji}>{workout.emoji}</Text>
            <View style={[styles.levelTag, showImage && styles.levelTagOnImage]}>
              <Text style={[styles.levelText, { color: ink }]}>{workout.level}</Text>
            </View>
          </View>

          <View>
            <Text style={[large ? styles.titleLarge : styles.title, { color: ink }]}>
              {workout.title}
            </Text>
            <Text style={[styles.subtitle, { color: inkDim }]}>{workout.subtitle}</Text>
            <View style={styles.metaRow}>
              <Meta icon="time-outline" text={`${workout.durationMin} min`} color={ink} />
              <Meta icon="flame-outline" text={`${workout.kcal} kcal`} color={ink} />
              <Meta icon="barbell-outline" text={`${workout.exercises.length} moves`} color={ink} />
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function Meta({
  icon,
  text,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  color: string;
}) {
  return (
    <View style={styles.meta}>
      <Ionicons name={icon} size={14} color={color} />
      <Text style={[styles.metaText, { color }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  largeWrap: { width: '100%' },
  card: {
    borderRadius: radius.xl,
    height: 170,
    overflow: 'hidden',
    backgroundColor: colors.surfaceAlt,
  },
  large: { height: 210 },
  inner: { flex: 1, padding: spacing.lg, justifyContent: 'space-between' },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  emoji: { fontSize: 34 },
  levelTag: {
    backgroundColor: 'rgba(11,11,15,0.25)',
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  levelTagOnImage: { backgroundColor: 'rgba(255,255,255,0.2)' },
  levelText: { ...typography.tiny, textTransform: 'capitalize' },
  title: { ...typography.h2 },
  titleLarge: { ...typography.h1 },
  subtitle: { ...typography.caption, marginTop: 2 },
  metaRow: { flexDirection: 'row', marginTop: spacing.md, gap: spacing.lg },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { ...typography.caption },
});
