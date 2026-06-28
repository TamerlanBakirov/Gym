import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../src/components/Button';
import { ProgressBar } from '../../src/components/ui';
import { QUIZ_STEPS } from '../../src/data/onboarding';
import { OnboardingAnswers } from '../../src/types';
import { colors, radius, spacing, typography } from '../../src/theme';

export default function Quiz() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<OnboardingAnswers>({});

  const step = QUIZ_STEPS[stepIndex];
  const total = QUIZ_STEPS.length;
  const progress = (stepIndex + 1) / total;

  const selectedMulti = (answers[step.key] as string[] | undefined) ?? [];
  const selectedSingle = answers[step.key] as string | number | undefined;

  const finish = (final: OnboardingAnswers) => {
    router.replace({
      pathname: '/onboarding/building',
      params: { answers: JSON.stringify(final) },
    });
  };

  const advance = (next: OnboardingAnswers) => {
    if (stepIndex + 1 >= total) finish(next);
    else setStepIndex((i) => i + 1);
  };

  const handleSingle = (value: string) => {
    Haptics.selectionAsync().catch(() => {});
    const parsed = step.key === 'daysPerWeek' ? Number(value) : value;
    const next = { ...answers, [step.key]: parsed } as OnboardingAnswers;
    setAnswers(next);
    setTimeout(() => advance(next), 180);
  };

  const toggleMulti = (value: string) => {
    Haptics.selectionAsync().catch(() => {});
    const set = new Set(selectedMulti);
    set.has(value) ? set.delete(value) : set.add(value);
    setAnswers({ ...answers, [step.key]: Array.from(set) } as OnboardingAnswers);
  };

  const goBack = () => {
    if (stepIndex === 0) router.back();
    else setStepIndex((i) => i - 1);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={goBack} hitSlop={12} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <View style={styles.progressWrap}>
          <ProgressBar progress={progress} />
        </View>
        <Text style={styles.counter}>
          {stepIndex + 1}/{total}
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.title}>{step.title}</Text>
        {step.subtitle ? <Text style={styles.subtitle}>{step.subtitle}</Text> : null}

        <View style={styles.options}>
          {step.options.map((opt) => {
            const active =
              step.type === 'multi'
                ? selectedMulti.includes(opt.value)
                : String(selectedSingle) === opt.value;
            return (
              <Pressable
                key={opt.value}
                onPress={() =>
                  step.type === 'multi' ? toggleMulti(opt.value) : handleSingle(opt.value)
                }
                style={[styles.option, active && styles.optionActive]}
              >
                <Text style={styles.optionEmoji}>{opt.emoji}</Text>
                <View style={styles.optionTextWrap}>
                  <Text style={[styles.optionLabel, active && styles.optionLabelActive]}>
                    {opt.label}
                  </Text>
                  {opt.sub ? <Text style={styles.optionSub}>{opt.sub}</Text> : null}
                </View>
                {step.type === 'multi' ? (
                  <View style={[styles.check, active && styles.checkActive]}>
                    {active ? (
                      <Ionicons name="checkmark" size={16} color={colors.primaryText} />
                    ) : null}
                  </View>
                ) : (
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={active ? colors.primary : colors.textFaint}
                  />
                )}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {step.type === 'multi' ? (
        <View style={styles.footer}>
          <Button
            label="Continue"
            disabled={selectedMulti.length === 0}
            onPress={() => advance(answers)}
          />
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.sm },
  backBtn: { width: 28 },
  progressWrap: { flex: 1 },
  counter: { ...typography.caption, color: colors.textMuted, width: 36, textAlign: 'right' },
  content: { paddingTop: spacing.xl, paddingBottom: spacing.xxl },
  title: { ...typography.h1, color: colors.text },
  subtitle: { ...typography.body, color: colors.textMuted, marginTop: spacing.sm },
  options: { marginTop: spacing.xl, gap: spacing.md },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: spacing.md,
  },
  optionActive: { borderColor: colors.primary, backgroundColor: colors.surfaceAlt },
  optionEmoji: { fontSize: 26 },
  optionTextWrap: { flex: 1 },
  optionLabel: { ...typography.h3, color: colors.text },
  optionLabelActive: { color: colors.text },
  optionSub: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  check: {
    width: 24,
    height: 24,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  footer: { paddingBottom: spacing.md },
});
