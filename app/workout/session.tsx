import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../src/components/Button';
import { ProgressBar } from '../../src/components/ui';
import { useApp } from '../../src/store/AppContext';
import { formatDuration } from '../../src/lib/format';
import { colors, gradients, radius, spacing, typography } from '../../src/theme';

type Phase = 'active' | 'rest' | 'done';

export default function Session() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { logWorkout, getWorkout } = useApp();
  const workout = getWorkout(id ?? '');

  const [exIndex, setExIndex] = useState(0);
  const [setNum, setSetNum] = useState(1);
  const [phase, setPhase] = useState<Phase>('active');
  const [seconds, setSeconds] = useState(0); // countdown for rest / timed move
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const exercises = workout?.exercises ?? [];
  const exercise = exercises[exIndex];

  // total sets across the workout, for the progress bar
  const totalSets = useMemo(
    () => exercises.reduce((s, e) => s + e.sets, 0),
    [exercises]
  );
  const completedSets = useMemo(
    () => exercises.slice(0, exIndex).reduce((s, e) => s + e.sets, 0) + (setNum - 1),
    [exercises, exIndex, setNum]
  );

  const clearTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  };

  // Drive countdowns for rest periods and timed exercises.
  useEffect(() => {
    clearTimer();
    if (phase === 'rest' || (phase === 'active' && exercise?.durationSec)) {
      timerRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) {
            clearTimer();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
            if (phase === 'rest') queueMicrotask(goAfterRest);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return clearTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, exIndex, setNum]);

  if (!workout || !exercise) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.notFound}>Workout not found.</Text>
        <Button label="Close" variant="secondary" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  const finish = () => {
    clearTimer();
    logWorkout({
      workoutId: workout.id,
      workoutTitle: workout.title,
      durationMin: workout.durationMin,
      kcal: workout.kcal,
    }).catch(() => {});
    setPhase('done');
  };

  // Advance to the next set or exercise after completing the current set.
  const completeSet = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    const isLastSet = setNum >= exercise.sets;
    const isLastExercise = exIndex >= exercises.length - 1;

    if (isLastSet && isLastExercise) {
      finish();
      return;
    }
    // Enter rest before the next set/exercise.
    setSeconds(exercise.restSec);
    setPhase('rest');
  };

  const goAfterRest = () => {
    setPhase('active');
    if (setNum >= exercise.sets) {
      setExIndex((i) => i + 1);
      setSetNum(1);
    } else {
      setSetNum((n) => n + 1);
    }
  };

  const skipRest = () => {
    clearTimer();
    goAfterRest();
  };

  // --- DONE SCREEN ---
  if (phase === 'done') {
    return (
      <View style={styles.root}>
        <LinearGradient colors={gradients.primary} style={StyleSheet.absoluteFill} />
        <SafeAreaView style={styles.doneWrap}>
          <View style={styles.doneCenter}>
            <View style={styles.doneIcon}>
              <Ionicons name="checkmark" size={64} color={colors.primaryText} />
            </View>
            <Text style={styles.doneTitle}>Workout complete!</Text>
            <Text style={styles.doneSub}>Great work. You showed up — that's what counts. 💪</Text>
            <View style={styles.doneStats}>
              <DoneStat value={`${workout.durationMin}`} label="minutes" />
              <DoneStat value={`${workout.kcal}`} label="kcal" />
              <DoneStat value={`${exercises.length}`} label="exercises" />
            </View>
          </View>
          <View style={styles.doneFooter}>
            <Button
              label="Finish"
              variant="secondary"
              onPress={() => router.replace('/(tabs)')}
            />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // --- REST SCREEN ---
  if (phase === 'rest') {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.topBar}>
          <Text style={styles.topBarText}>Rest</Text>
          <Pressable onPress={finishConfirm(router, finish)} hitSlop={12}>
            <Ionicons name="close" size={26} color={colors.textMuted} />
          </Pressable>
        </View>
        <View style={styles.restCenter}>
          <Text style={styles.restLabel}>REST</Text>
          <Text style={styles.restTime}>{formatDuration(seconds)}</Text>
          <Text style={styles.restNext}>
            Next: {nextLabel(exercises, exIndex, setNum, exercise.sets)}
          </Text>
        </View>
        <View style={styles.footer}>
          <View style={styles.restButtons}>
            <Button
              label="-15s"
              variant="secondary"
              style={{ flex: 1 }}
              onPress={() => setSeconds((s) => Math.max(1, s - 15))}
            />
            <Button label="Skip rest" style={{ flex: 1 }} onPress={skipRest} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // --- ACTIVE EXERCISE SCREEN ---
  const isTimed = !!exercise.durationSec;
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <Text style={styles.topBarText}>
          {exIndex + 1}/{exercises.length} · {workout.title}
        </Text>
        <Pressable onPress={finishConfirm(router, finish)} hitSlop={12}>
          <Ionicons name="close" size={26} color={colors.textMuted} />
        </Pressable>
      </View>

      <View style={styles.progressWrap}>
        <ProgressBar progress={totalSets ? completedSets / totalSets : 0} />
      </View>

      <View style={styles.activeCenter}>
        <ExerciseVisual
          key={`${exIndex}-${exercise.id}`}
          uri={exercise.imageUrl}
          emoji={exercise.emoji}
        />
        <Text style={styles.exTitle}>{exercise.name}</Text>
        <View style={styles.setPill}>
          <Text style={styles.setPillText}>
            Set {setNum} of {exercise.sets}
          </Text>
        </View>

        {isTimed ? (
          <Text style={styles.target}>
            {seconds > 0 ? formatDuration(seconds) : formatDuration(exercise.durationSec!)}
          </Text>
        ) : (
          <Text style={styles.target}>{exercise.reps} reps</Text>
        )}

        <View style={styles.cueBox}>
          <Ionicons name="bulb" size={16} color={colors.primary} />
          <Text style={styles.cueText}>{exercise.cue}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        {isTimed && seconds === 0 ? (
          <Button
            label="Start timer"
            variant="secondary"
            onPress={() => setSeconds(exercise.durationSec!)}
          />
        ) : null}
        <Button
          label={setNum >= exercise.sets && exIndex >= exercises.length - 1 ? 'Finish workout' : 'Done — next'}
          icon={<Ionicons name="checkmark" size={18} color={colors.primaryText} />}
          onPress={completeSet}
          style={{ marginTop: isTimed && seconds === 0 ? spacing.md : 0 }}
        />
      </View>
    </SafeAreaView>
  );
}

/** Large exercise visual with graceful emoji fallback. */
function ExerciseVisual({ uri, emoji }: { uri?: string | null; emoji: string }) {
  const [err, setErr] = useState(false);
  if (uri && !err) {
    return (
      <Image
        source={{ uri }}
        style={styles.visual}
        onError={() => setErr(true)}
        resizeMode="cover"
      />
    );
  }
  return <Text style={styles.bigEmoji}>{emoji}</Text>;
}

function DoneStat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.doneStat}>
      <Text style={styles.doneStatValue}>{value}</Text>
      <Text style={styles.doneStatLabel}>{label}</Text>
    </View>
  );
}

function nextLabel(
  exercises: { name: string; sets: number }[],
  exIndex: number,
  setNum: number,
  sets: number
): string {
  if (setNum >= sets) {
    const next = exercises[exIndex + 1];
    return next ? next.name : 'Finish';
  }
  return `${exercises[exIndex].name} (set ${setNum + 1})`;
}

// Lightweight confirm wrapper kept inline to avoid extra deps.
function finishConfirm(router: ReturnType<typeof useRouter>, _finish: () => void) {
  return () => router.back();
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  safe: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: spacing.lg },
  notFound: { ...typography.body, color: colors.textMuted, textAlign: 'center', marginBottom: spacing.lg },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
  },
  topBarText: { ...typography.caption, color: colors.textMuted },
  progressWrap: { marginTop: spacing.md },
  activeCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  bigEmoji: { fontSize: 96 },
  visual: {
    width: 220,
    height: 220,
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceAlt,
  },
  exTitle: { ...typography.display, color: colors.text, marginTop: spacing.lg, textAlign: 'center' },
  setPill: {
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    marginTop: spacing.md,
  },
  setPillText: { ...typography.caption, color: colors.text },
  target: { fontSize: 56, fontWeight: '800', color: colors.primary, marginTop: spacing.lg },
  cueBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginTop: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cueText: { ...typography.bodyMuted, color: colors.textMuted, flex: 1 },
  footer: { paddingBottom: spacing.lg },
  restCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  restLabel: { ...typography.tiny, color: colors.primary, letterSpacing: 3 },
  restTime: { fontSize: 88, fontWeight: '800', color: colors.text, marginTop: spacing.sm },
  restNext: { ...typography.body, color: colors.textMuted, marginTop: spacing.lg },
  restButtons: { flexDirection: 'row', gap: spacing.md },
  doneWrap: { flex: 1, paddingHorizontal: spacing.lg },
  doneCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  doneIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(11,11,15,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneTitle: { ...typography.display, color: colors.primaryText, marginTop: spacing.xl, textAlign: 'center' },
  doneSub: {
    ...typography.body,
    color: 'rgba(11,11,15,0.8)',
    marginTop: spacing.sm,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  doneStats: {
    flexDirection: 'row',
    gap: spacing.xl,
    marginTop: spacing.xxl,
  },
  doneStat: { alignItems: 'center' },
  doneStatValue: { ...typography.display, color: colors.primaryText },
  doneStatLabel: { ...typography.caption, color: 'rgba(11,11,15,0.75)' },
  doneFooter: { paddingBottom: spacing.lg },
});
