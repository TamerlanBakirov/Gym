import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../src/components/ui';
import { useApp } from '../../src/store/AppContext';
import { useI18n } from '../../src/i18n';
import { colors, radius, spacing, typography } from '../../src/theme';

export default function Profile() {
  const router = useRouter();
  const { user, profile: p, settings, updateSettings, logout, requestEmailVerification, confirmEmailVerification } =
    useApp();
  const { t, locale, setLocale } = useI18n();
  const profile = p!;

  // Email verification flow state.
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [verifyCode, setVerifyCode] = useState('');
  const [verifyHint, setVerifyHint] = useState<string | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [verifyBusy, setVerifyBusy] = useState(false);

  const startVerify = async () => {
    setVerifyError(null);
    setVerifyBusy(true);
    try {
      const res = await requestEmailVerification();
      if (res.alreadyVerified) return;
      setVerifyOpen(true);
      if (res.devCode) {
        setVerifyCode(res.devCode);
        setVerifyHint(t('profile.verifyDevHint', { code: res.devCode }));
      }
    } catch {
      setVerifyError(t('profile.sendError'));
    } finally {
      setVerifyBusy(false);
    }
  };

  const submitVerify = async () => {
    setVerifyError(null);
    if (verifyCode.length !== 6) return setVerifyError(t('profile.enterCode'));
    setVerifyBusy(true);
    try {
      await confirmEmailVerification(verifyCode);
      setVerifyOpen(false);
      setVerifyCode('');
    } catch {
      setVerifyError(t('profile.codeError'));
    } finally {
      setVerifyBusy(false);
    }
  };

  const confirmLogout = () => {
    Alert.alert(t('profile.logoutTitle'), t('profile.logoutMsg'), [
      { text: 'Cancel', style: 'cancel' },
      {
        text: t('profile.logout'),
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/auth');
        },
      },
    ]);
  };

  const initials = profile.name.slice(0, 2).toUpperCase();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.title}>{t('profile.title')}</Text>

        {/* Identity card */}
        <Card style={styles.identity}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.sub}>
            {t(`goals.${profile.goal}`)} · {t(`levels.${profile.level}`)}
          </Text>
          <View style={styles.identityStats}>
            <IdStat value={`${profile.weightKg}`} label="kg" />
            <View style={styles.idDivider} />
            <IdStat value={`${profile.heightCm}`} label="cm" />
            <View style={styles.idDivider} />
            <IdStat value={`${profile.daysPerWeek}x`} label="per week" />
          </View>
        </Card>

        {/* Email verification */}
        {user && !user.emailVerified ? (
          <Card style={styles.verifyCard}>
            <View style={styles.verifyHeader}>
              <View style={styles.verifyIcon}>
                <Ionicons name="mail-unread" size={18} color={colors.accent4} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.verifyTitle}>{t('profile.verifyTitle')}</Text>
                <Text style={styles.verifySub}>{user.email}</Text>
              </View>
              {!verifyOpen ? (
                <TouchableOpacity style={styles.verifyBtn} onPress={startVerify} disabled={verifyBusy}>
                  <Text style={styles.verifyBtnText}>{verifyBusy ? '…' : t('profile.sendCode')}</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            {verifyOpen ? (
              <View style={styles.verifyBody}>
                {verifyHint ? <Text style={styles.verifyDevHint}>{verifyHint}</Text> : null}
                <View style={styles.verifyRow}>
                  <TextInput
                    value={verifyCode}
                    onChangeText={setVerifyCode}
                    placeholder={t('profile.codePlaceholder')}
                    placeholderTextColor={colors.textFaint}
                    keyboardType="number-pad"
                    maxLength={6}
                    style={styles.verifyInput}
                  />
                  <TouchableOpacity style={styles.verifyConfirm} onPress={submitVerify} disabled={verifyBusy}>
                    <Text style={styles.verifyConfirmText}>{t('profile.confirm')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}

            {verifyError ? <Text style={styles.verifyErr}>{verifyError}</Text> : null}
          </Card>
        ) : null}

        {/* Goals */}
        <Text style={styles.sectionTitle}>{t('profile.yourGoals')}</Text>
        <Card>
          <InfoRow icon="flag" label={t('profile.mainGoal')} value={t(`goals.${profile.goal}`)} />
          <Sep />
          <InfoRow icon="speedometer" label={t('profile.fitnessLevel')} value={t(`levels.${profile.level}`)} />
          <Sep />
          <InfoRow icon="fitness" label={t('profile.equipment')} value={t(`equipment.${profile.equipment}`)} />
          <Sep />
          <InfoRow
            icon="locate"
            label={t('profile.targetWeight')}
            value={`${profile.targetWeightKg} kg`}
          />
        </Card>

        {/* Settings */}
        <Text style={styles.sectionTitle}>{t('profile.settings')}</Text>
        <Card>
          <View style={styles.toggleRow}>
            <View style={styles.rowLeft}>
              <View style={styles.rowIcon}>
                <Ionicons name="notifications" size={18} color={colors.primary} />
              </View>
              <Text style={styles.rowLabel}>{t('profile.reminders')}</Text>
            </View>
            <Switch
              value={settings.reminders}
              onValueChange={(v) => updateSettings({ reminders: v }).catch(() => {})}
              trackColor={{ false: colors.surfaceAlt, true: colors.primaryDim }}
              thumbColor={settings.reminders ? colors.primary : '#f4f3f4'}
            />
          </View>
          <Sep />
          <TouchableOpacity
            style={styles.toggleRow}
            onPress={() =>
              updateSettings({
                units: settings.units === 'metric' ? 'imperial' : 'metric',
              }).catch(() => {})
            }
          >
            <View style={styles.rowLeft}>
              <View style={styles.rowIcon}>
                <Ionicons name="options" size={18} color={colors.primary} />
              </View>
              <Text style={styles.rowLabel}>{t('profile.units')}</Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={styles.rowValue}>
                {settings.units === 'metric' ? t('profile.metric') : t('profile.imperial')}
              </Text>
              <Ionicons name="swap-horizontal" size={18} color={colors.textFaint} />
            </View>
          </TouchableOpacity>
          <Sep />
          <TouchableOpacity
            style={styles.toggleRow}
            onPress={() => setLocale(locale === 'tr' ? 'en' : 'tr')}
          >
            <View style={styles.rowLeft}>
              <View style={styles.rowIcon}>
                <Ionicons name="language" size={18} color={colors.primary} />
              </View>
              <Text style={styles.rowLabel}>{t('profile.language')}</Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={styles.rowValue}>{locale === 'tr' ? 'Türkçe' : 'English'}</Text>
              <Ionicons name="swap-horizontal" size={18} color={colors.textFaint} />
            </View>
          </TouchableOpacity>
        </Card>

        {/* Account */}
        <TouchableOpacity style={styles.resetBtn} onPress={confirmLogout}>
          <Ionicons name="log-out-outline" size={18} color={colors.danger} />
          <Text style={styles.resetText}>{t('profile.logout')}</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Forge · v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function IdStat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.idStat}>
      <Text style={styles.idValue}>{value}</Text>
      <Text style={styles.idLabel}>{label}</Text>
    </View>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.rowLeft}>
        <View style={styles.rowIcon}>
          <Ionicons name={icon} size={18} color={colors.primary} />
        </View>
        <Text style={styles.rowLabel}>{label}</Text>
      </View>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const Sep = () => <View style={styles.sep} />;
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const equipLabel = (e: string) =>
  e === 'none' ? 'Bodyweight' : e === 'minimal' ? 'Minimal' : 'Full gym';

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, paddingTop: spacing.sm },
  title: { ...typography.display, color: colors.text },
  identity: { alignItems: 'center', marginTop: spacing.lg },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { ...typography.h1, color: colors.primaryText },
  name: { ...typography.h1, color: colors.text, marginTop: spacing.md },
  sub: { ...typography.body, color: colors.textMuted, marginTop: 2, textTransform: 'capitalize' },
  identityStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    alignSelf: 'stretch',
  },
  idStat: { flex: 1, alignItems: 'center' },
  idValue: { ...typography.h2, color: colors.text },
  idLabel: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  idDivider: { width: 1, height: 30, backgroundColor: colors.border },
  sectionTitle: { ...typography.h3, color: colors.text, marginTop: spacing.xl, marginBottom: spacing.md },
  verifyCard: { marginTop: spacing.lg, borderColor: 'rgba(255,177,62,0.35)' },
  verifyHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  verifyIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(255,177,62,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyTitle: { ...typography.h3, color: colors.text },
  verifySub: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  verifyBtn: {
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  verifyBtnText: { ...typography.caption, color: colors.primary },
  verifyBody: { marginTop: spacing.md },
  verifyDevHint: { ...typography.caption, color: colors.primary, marginBottom: spacing.sm },
  verifyRow: { flexDirection: 'row', gap: spacing.sm },
  verifyInput: {
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
  verifyConfirm: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyConfirmText: { ...typography.h3, color: colors.primaryText },
  verifyErr: { ...typography.caption, color: colors.danger, marginTop: spacing.sm },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: { ...typography.body, color: colors.text },
  rowValue: { ...typography.body, color: colors.textMuted },
  sep: { height: 1, backgroundColor: colors.border, marginVertical: 2 },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.xl,
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,90,90,0.3)',
  },
  resetText: { ...typography.h3, color: colors.danger },
  version: { ...typography.caption, color: colors.textFaint, textAlign: 'center', marginTop: spacing.xl },
});
