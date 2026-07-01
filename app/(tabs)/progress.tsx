import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../src/components/ui';
import { useApp } from '../../src/store/AppContext';
import { useI18n } from '../../src/i18n';
import { computeStreak, lastNDays, prettyDate } from '../../src/lib/format';
import { colors, radius, spacing, typography } from '../../src/theme';

export default function Progress() {
  const { profile, logs, weightEntries, addWeight } = useApp();
  const { t } = useI18n();
  const [input, setInput] = useState('');

  const totalWorkouts = logs.length;
  const totalKcal = logs.reduce((s, l) => s + l.kcal, 0);
  const totalMin = logs.reduce((s, l) => s + l.durationMin, 0);
  const streak = computeStreak(logs.map((l) => l.date));

  // Last 7 days workout counts for the bar chart.
  const days = lastNDays(7);
  const countByDay = useMemo(() => {
    const map: Record<string, number> = {};
    for (const l of logs) map[l.date] = (map[l.date] ?? 0) + 1;
    return days.map((d) => ({ date: d, count: map[d] ?? 0 }));
  }, [logs]);
  const maxCount = Math.max(1, ...countByDay.map((d) => d.count));

  // Weight trend.
  const weights = weightEntries;
  const startW = weights[0]?.weightKg;
  const currentW = weights[weights.length - 1]?.weightKg;
  const target = profile?.targetWeightKg;
  const delta = startW != null && currentW != null ? currentW - startW : 0;

  const minW = weights.length ? Math.min(...weights.map((w) => w.weightKg)) : 0;
  const maxW = weights.length ? Math.max(...weights.map((w) => w.weightKg)) : 1;
  const range = Math.max(1, maxW - minW);

  const submitWeight = () => {
    const val = parseFloat(input.replace(',', '.'));
    if (!isNaN(val) && val > 20 && val < 400) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      addWeight(Math.round(val * 10) / 10).catch(() => {});
      setInput('');
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.title}>{t('progress.title')}</Text>

        {/* Headline stats */}
        <View style={styles.statsGrid}>
          <StatBox icon="barbell" value={`${totalWorkouts}`} label={t('progress.workouts')} color={colors.primary} />
          <StatBox icon="flame" value={`${totalKcal}`} label={t('progress.calories')} color={colors.accent2} />
          <StatBox icon="time" value={`${totalMin}`} label={t('progress.minutes')} color={colors.accent3} />
          <StatBox icon="trophy" value={`${streak}d`} label={t('progress.streak')} color={colors.accent4} />
        </View>

        {/* Activity chart */}
        <Card style={styles.section}>
          <Text style={styles.cardTitle}>{t('progress.last7')}</Text>
          <View style={styles.chart}>
            {countByDay.map((d) => (
              <View key={d.date} style={styles.barCol}>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: `${(d.count / maxCount) * 100}%`,
                        backgroundColor: d.count > 0 ? colors.primary : colors.surfaceAlt,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.barLabel}>
                  {new Date(d.date + 'T00:00:00').toLocaleDateString(undefined, {
                    weekday: 'narrow',
                  })}
                </Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Weight tracking */}
        <Card style={styles.section}>
          <View style={styles.weightHeader}>
            <View>
              <Text style={styles.cardTitle}>{t('progress.weight')}</Text>
              <Text style={styles.weightCurrent}>
                {currentW != null ? `${currentW} kg` : '—'}
                {target != null ? <Text style={styles.weightTarget}>  →  {target} kg</Text> : null}
              </Text>
            </View>
            {weights.length > 1 ? (
              <View
                style={[
                  styles.deltaChip,
                  { backgroundColor: delta <= 0 ? 'rgba(74,222,128,0.15)' : 'rgba(255,90,90,0.15)' },
                ]}
              >
                <Ionicons
                  name={delta <= 0 ? 'arrow-down' : 'arrow-up'}
                  size={14}
                  color={delta <= 0 ? colors.success : colors.danger}
                />
                <Text
                  style={[styles.deltaText, { color: delta <= 0 ? colors.success : colors.danger }]}
                >
                  {Math.abs(delta).toFixed(1)} kg
                </Text>
              </View>
            ) : null}
          </View>

          {weights.length > 1 ? (
            <View style={styles.weightChart}>
              {weights.slice(-8).map((w) => (
                <View key={w.id} style={styles.barCol}>
                  <View style={styles.weightBarTrack}>
                    <View
                      style={[
                        styles.weightBar,
                        { height: `${20 + ((w.weightKg - minW) / range) * 80}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.barLabel}>{prettyDate(w.date).split(' ')[1]}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.hint}>{t('progress.logHint')}</Text>
          )}

          <View style={styles.weightInputRow}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder={t('progress.todaysWeight')}
              placeholderTextColor={colors.textFaint}
              keyboardType="decimal-pad"
              style={styles.input}
              returnKeyType="done"
              onSubmitEditing={submitWeight}
            />
            <TouchableOpacity style={styles.addBtn} onPress={submitWeight}>
              <Ionicons name="add" size={24} color={colors.primaryText} />
            </TouchableOpacity>
          </View>
        </Card>

        {/* Recent activity */}
        <Text style={[styles.title, styles.recentTitle]}>{t('progress.recent')}</Text>
        {logs.length === 0 ? (
          <Card>
            <Text style={styles.hint}>{t('progress.noneYet')}</Text>
          </Card>
        ) : (
          <View style={styles.activityList}>
            {logs.slice(0, 10).map((l) => (
              <View key={l.id} style={styles.activityRow}>
                <View style={styles.activityIcon}>
                  <Ionicons name="checkmark-done" size={18} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.activityTitle}>{l.workoutTitle}</Text>
                  <Text style={styles.activityMeta}>
                    {prettyDate(l.date)} · {l.durationMin} min · {l.kcal} kcal
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatBox({
  icon,
  value,
  label,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
  color: string;
}) {
  return (
    <View style={styles.statBox}>
      <Ionicons name={icon} size={22} color={color} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, paddingTop: spacing.sm },
  title: { ...typography.display, color: colors.text },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  statBox: {
    width: '47%',
    flexGrow: 1,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: { ...typography.h1, color: colors.text, marginTop: spacing.sm },
  statLabel: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  section: { marginTop: spacing.xl },
  cardTitle: { ...typography.h3, color: colors.text },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    marginTop: spacing.lg,
  },
  barCol: { flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end' },
  barTrack: { width: 12, height: 90, justifyContent: 'flex-end', borderRadius: radius.pill },
  bar: { width: 12, borderRadius: radius.pill, minHeight: 6 },
  barLabel: { ...typography.tiny, color: colors.textMuted, marginTop: spacing.sm },
  weightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  weightCurrent: { ...typography.h2, color: colors.text, marginTop: 4 },
  weightTarget: { ...typography.body, color: colors.textMuted },
  deltaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  deltaText: { ...typography.caption },
  weightChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 110,
    marginTop: spacing.lg,
  },
  weightBarTrack: { width: 14, height: 80, justifyContent: 'flex-end' },
  weightBar: { width: 14, borderRadius: radius.pill, backgroundColor: colors.accent3, minHeight: 8 },
  weightInputRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
  input: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    color: colors.text,
    ...typography.body,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addBtn: {
    width: 52,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: { ...typography.body, color: colors.textMuted, marginTop: spacing.md },
  recentTitle: { fontSize: 22, marginTop: spacing.xl, marginBottom: spacing.md },
  activityList: { gap: spacing.sm },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activityIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityTitle: { ...typography.h3, color: colors.text },
  activityMeta: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
});
