import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import { colors, gradients, radius, spacing, typography } from '../theme';

/** Card surface. */
export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

/** Section header with optional action on the right. */
export function SectionHeader({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action}
    </View>
  );
}

/** Small uppercase eyebrow label. */
export function Eyebrow({ children, color }: { children: string; color?: string }) {
  return <Text style={[styles.eyebrow, color ? { color } : null]}>{children}</Text>;
}

/** Thin progress bar. */
export function ProgressBar({
  progress,
  color = colors.primary,
  height = 8,
}: {
  progress: number;
  color?: string;
  height?: number;
}) {
  const pct = Math.max(0, Math.min(1, progress));
  return (
    <View style={[styles.track, { height, borderRadius: height }]}>
      <View
        style={{
          width: `${pct * 100}%`,
          backgroundColor: color,
          height,
          borderRadius: height,
        }}
      />
    </View>
  );
}

/** Rounded pill tag. */
export function Tag({
  label,
  color = colors.textMuted,
  bg = colors.surfaceAlt,
}: {
  label: string;
  color?: string;
  bg?: string;
}) {
  return (
    <View style={[styles.tag, { backgroundColor: bg }]}>
      <Text style={[styles.tagText, { color }]}>{label}</Text>
    </View>
  );
}

/** Circular stat ring (simple, no svg). */
export function StatPill({
  value,
  label,
  accent = colors.primary,
}: {
  value: string;
  label: string;
  accent?: string;
}) {
  return (
    <View style={styles.statPill}>
      <Text style={[styles.statValue, { color: accent }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const GRAD_MAP = gradients;
export function GradientCard({
  gradient,
  children,
  style,
}: {
  gradient: keyof typeof GRAD_MAP;
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  return (
    <LinearGradient
      colors={GRAD_MAP[gradient]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.gradientCard, style]}
    >
      {children}
    </LinearGradient>
  );
}

export function Title({ children, style }: { children: React.ReactNode; style?: TextStyle }) {
  return <Text style={[styles.h1, style]}>{children}</Text>;
}

export function Muted({ children, style }: { children: React.ReactNode; style?: TextStyle }) {
  return <Text style={[styles.muted, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: { ...typography.h2, color: colors.text },
  eyebrow: { ...typography.tiny, color: colors.primary, textTransform: 'uppercase' },
  track: { width: '100%', backgroundColor: colors.surfaceAlt, overflow: 'hidden' },
  tag: {
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  tagText: { ...typography.caption },
  statPill: { alignItems: 'center', flex: 1 },
  statValue: { ...typography.h2 },
  statLabel: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  gradientCard: { borderRadius: radius.lg, padding: spacing.lg },
  h1: { ...typography.h1, color: colors.text },
  muted: { ...typography.bodyMuted, color: colors.textMuted },
});
