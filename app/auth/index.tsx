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
import { ApiError } from '../../src/api/client';
import { useApp } from '../../src/store/AppContext';
import { colors, radius, spacing, typography } from '../../src/theme';

type Mode = 'login' | 'register';

export default function Auth() {
  const router = useRouter();
  const { login, register } = useApp();
  const [mode, setMode] = useState<Mode>('register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isRegister = mode === 'register';

  const submit = async () => {
    setError(null);
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    if (isRegister && !name.trim()) {
      setError('Please enter your name.');
      return;
    }
    setLoading(true);
    try {
      if (isRegister) await register(email.trim(), password, name.trim());
      else await login(email.trim(), password);
      router.replace('/');
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError('Could not connect to the server. Check your connection.');
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
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.brandRow}>
              <View style={styles.logoDot}>
                <Ionicons name="flame" size={20} color={colors.primaryText} />
              </View>
              <Text style={styles.brand}>FORGE</Text>
            </View>

            <Text style={styles.title}>
              {isRegister ? 'Create your account' : 'Welcome back'}
            </Text>
            <Text style={styles.subtitle}>
              {isRegister
                ? 'Start your transformation today.'
                : 'Log in to continue your journey.'}
            </Text>

            <View style={styles.form}>
              {isRegister ? (
                <Field
                  icon="person-outline"
                  placeholder="Your name"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              ) : null}
              <Field
                icon="mail-outline"
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Field
                icon="lock-closed-outline"
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />

              {error ? (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle" size={16} color={colors.danger} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <Button
                label={isRegister ? 'Create account' : 'Log in'}
                onPress={submit}
                loading={loading}
                style={{ marginTop: spacing.md }}
              />

              {!isRegister ? (
                <Pressable onPress={() => router.push('/auth/reset')} style={styles.forgot}>
                  <Text style={styles.forgotText}>Forgot password?</Text>
                </Pressable>
              ) : null}
            </View>

            <Pressable
              onPress={() => {
                setMode(isRegister ? 'login' : 'register');
                setError(null);
              }}
              style={styles.switchRow}
            >
              <Text style={styles.switchText}>
                {isRegister ? 'Already have an account? ' : "Don't have an account? "}
                <Text style={styles.switchLink}>{isRegister ? 'Log in' : 'Sign up'}</Text>
              </Text>
            </Pressable>
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
      <TextInput
        {...props}
        placeholderTextColor={colors.textFaint}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  safe: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: spacing.lg, paddingVertical: spacing.xl, justifyContent: 'center' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xxl },
  logoDot: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: { ...typography.h3, color: colors.text, letterSpacing: 2 },
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
  forgot: { alignItems: 'center', marginTop: spacing.xs },
  forgotText: { ...typography.caption, color: colors.textMuted },
  switchRow: { alignItems: 'center', marginTop: spacing.xl },
  switchText: { ...typography.body, color: colors.textMuted },
  switchLink: { color: colors.primary, fontWeight: '700' },
});
