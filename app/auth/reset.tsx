import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../src/components/Button';
import { Api } from '../../src/api';
import { ApiError } from '../../src/api/client';
import { useI18n } from '../../src/i18n';
import { colors, radius, spacing, typography } from '../../src/theme';

export default function ResetPassword() {
  const router = useRouter();
  const { t } = useI18n();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [devHint, setDevHint] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const sendCode = async () => {
    setError(null);
    if (!email.trim()) return setError(t('reset.enterEmail'));
    setLoading(true);
    try {
      const res = await Api.forgotPassword(email.trim());
      if (res.devCode) {
        setCode(res.devCode);
        setDevHint(t('reset.devCode', { code: res.devCode }));
      }
      setStep(2);
    } catch {
      setError(t('reset.serverError'));
    } finally {
      setLoading(false);
    }
  };

  const submitReset = async () => {
    setError(null);
    if (code.length !== 6) return setError(t('reset.enterCode'));
    if (password.length < 6) return setError(t('reset.shortPass'));
    setLoading(true);
    try {
      await Api.resetPassword(email.trim(), code, password);
      router.replace('/auth');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('reset.resetError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#1A1A22', '#0B0B0F']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <Pressable onPress={() => router.back()} hitSlop={12} style={styles.back}>
              <Ionicons name="chevron-back" size={26} color={colors.text} />
            </Pressable>

            <Text style={styles.title}>{t('reset.title')}</Text>
            <Text style={styles.subtitle}>
              {step === 1
                ? t('reset.subEmail')
                : t('reset.subCode')}
            </Text>

            <View style={styles.form}>
              {step === 1 ? (
                <>
                  <Field
                    icon="mail-outline"
                    placeholder={t('auth.email')}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  {error ? <ErrorText text={error} /> : null}
                  <Button
                    label={t('reset.sendCode')}
                    onPress={sendCode}
                    loading={loading}
                    style={{ marginTop: spacing.md }}
                  />
                </>
              ) : (
                <>
                  {devHint ? <Text style={styles.devHint}>{devHint}</Text> : null}
                  <Field
                    icon="keypad-outline"
                    placeholder={t('reset.code')}
                    value={code}
                    onChangeText={setCode}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                  <Field
                    icon="lock-closed-outline"
                    placeholder={t('reset.newPassword')}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    autoCapitalize="none"
                  />
                  {error ? <ErrorText text={error} /> : null}
                  <Button
                    label={t('reset.resetBtn')}
                    onPress={submitReset}
                    loading={loading}
                    style={{ marginTop: spacing.md }}
                  />
                  <Pressable onPress={sendCode} style={styles.resend}>
                    <Text style={styles.resendText}>{t('reset.resend')}</Text>
                  </Pressable>
                </>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

function Field({
  icon,
  ...props
}: { icon: keyof typeof Ionicons.glyphMap } & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={styles.field}>
      <Ionicons name={icon} size={20} color={colors.textFaint} />
      <TextInput {...props} placeholderTextColor={colors.textFaint} style={styles.input} />
    </View>
  );
}

function ErrorText({ text }: { text: string }) {
  return (
    <View style={styles.errorBox}>
      <Ionicons name="alert-circle" size={16} color={colors.danger} />
      <Text style={styles.errorText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  safe: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: spacing.lg, paddingVertical: spacing.xl },
  back: { width: 40, height: 40, justifyContent: 'center', marginBottom: spacing.md },
  title: { ...typography.display, color: colors.text },
  subtitle: { ...typography.body, color: colors.textMuted, marginTop: spacing.sm },
  form: { marginTop: spacing.xl, gap: spacing.md },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: { flex: 1, paddingVertical: 16, color: colors.text, ...typography.body },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(255,90,90,0.12)',
    borderRadius: radius.md,
    padding: spacing.md,
  },
  errorText: { ...typography.caption, color: colors.danger, flex: 1 },
  devHint: { ...typography.caption, color: colors.primary },
  resend: { alignItems: 'center', marginTop: spacing.md },
  resendText: { ...typography.body, color: colors.primary, fontWeight: '700' },
});
