import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProgressBar } from '../../src/components/ui';
import { useI18n } from '../../src/i18n';
import { colors, radius, spacing, typography } from '../../src/theme';

const STEP_KEYS = [
  'building.step1',
  'building.step2',
  'building.step3',
  'building.step4',
  'building.step5',
];

export default function Building() {
  const router = useRouter();
  const { t } = useI18n();
  const STEPS = STEP_KEYS.map((k) => t(k));
  const { answers } = useLocalSearchParams<{ answers: string }>();
  const [pct, setPct] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(anim, {
        toValue: 1,
        duration: 1400,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    const interval = setInterval(() => {
      setPct((p) => {
        const next = Math.min(1, p + 0.0125);
        setActiveStep(Math.min(STEPS.length - 1, Math.floor(next * STEPS.length)));
        if (next >= 1) {
          clearInterval(interval);
          setTimeout(
            () =>
              router.replace({
                pathname: '/onboarding/plan',
                params: { answers },
              }),
            350
          );
        }
        return next;
      });
    }, 45);

    return () => clearInterval(interval);
  }, []);

  const spin = anim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.center}>
        <Animated.View style={[styles.ring, { transform: [{ rotate: spin }] }]}>
          <View style={styles.ringInner}>
            <Text style={styles.pctText}>{Math.round(pct * 100)}%</Text>
          </View>
        </Animated.View>

        <Text style={styles.title}>{t('building.title')}</Text>
        <Text style={styles.subtitle}>{t('building.subtitle')}</Text>

        <View style={styles.bar}>
          <ProgressBar progress={pct} />
        </View>

        <View style={styles.steps}>
          {STEPS.map((s, i) => {
            const done = i < activeStep;
            const current = i === activeStep;
            return (
              <View key={s} style={styles.stepRow}>
                <View
                  style={[
                    styles.stepDot,
                    done && styles.stepDotDone,
                    current && styles.stepDotCurrent,
                  ]}
                >
                  {done ? (
                    <Ionicons name="checkmark" size={13} color={colors.primaryText} />
                  ) : null}
                </View>
                <Text
                  style={[
                    styles.stepText,
                    (done || current) && { color: colors.text },
                  ]}
                >
                  {s}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },
  ring: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 6,
    borderColor: colors.surfaceAlt,
    borderTopColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  ringInner: { alignItems: 'center', justifyContent: 'center' },
  pctText: { ...typography.h1, color: colors.text },
  title: { ...typography.h1, color: colors.text },
  subtitle: { ...typography.body, color: colors.textMuted, marginTop: spacing.sm, textAlign: 'center' },
  bar: { width: '100%', marginTop: spacing.xl },
  steps: { marginTop: spacing.xl, alignSelf: 'stretch', gap: spacing.md },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  stepDot: {
    width: 22,
    height: 22,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotDone: { backgroundColor: colors.primary, borderColor: colors.primary },
  stepDotCurrent: { borderColor: colors.primary },
  stepText: { ...typography.body, color: colors.textFaint },
});
