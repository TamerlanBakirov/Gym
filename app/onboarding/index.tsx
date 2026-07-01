import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../src/components/Button';
import { useI18n } from '../../src/i18n';
import { colors, gradients, radius, spacing, typography } from '../../src/theme';

const PERKS = [
  { icon: 'sparkles', key: 'welcome.perk1' },
  { icon: 'home', key: 'welcome.perk2' },
  { icon: 'trending-up', key: 'welcome.perk3' },
] as const;

export default function Welcome() {
  const router = useRouter();
  const { t } = useI18n();
  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#1A1A22', '#0B0B0F']}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.brandRow}>
          <View style={styles.logoDot}>
            <Ionicons name="flame" size={20} color={colors.primaryText} />
          </View>
          <Text style={styles.brand}>FORGE</Text>
        </View>

        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>🏋️‍♂️</Text>
          <Text style={styles.title}>{t('welcome.title')}</Text>
          <Text style={styles.subtitle}>{t('welcome.subtitle')}</Text>

          <View style={styles.perks}>
            {PERKS.map((p) => (
              <View key={p.key} style={styles.perk}>
                <View style={styles.perkIcon}>
                  <Ionicons name={p.icon as any} size={16} color={colors.primary} />
                </View>
                <Text style={styles.perkText}>{t(p.key)}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          <Button label={t('welcome.getStarted')} onPress={() => router.push('/onboarding/quiz')} />
          <Text style={styles.terms}>{t('welcome.terms')}</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  safe: { flex: 1, paddingHorizontal: spacing.lg, justifyContent: 'space-between' },
  brandRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md, gap: spacing.sm },
  logoDot: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: { ...typography.h3, color: colors.text, letterSpacing: 2 },
  hero: { flex: 1, justifyContent: 'center' },
  heroEmoji: { fontSize: 64, marginBottom: spacing.lg },
  title: { ...typography.display, color: colors.text, lineHeight: 40 },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.md,
    lineHeight: 22,
  },
  perks: { marginTop: spacing.xxl, gap: spacing.md },
  perk: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  perkIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  perkText: { ...typography.body, color: colors.text },
  footer: { paddingBottom: spacing.md, gap: spacing.md },
  terms: { ...typography.caption, color: colors.textFaint, textAlign: 'center' },
});
