import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../src/components/ui';
import { useApp } from '../../src/store/AppContext';
import { goalLabel } from '../../src/lib/plan';
import { colors, radius, spacing, typography } from '../../src/theme';

export default function Profile() {
  const router = useRouter();
  const { profile: p, settings, updateSettings, logout } = useApp();
  const profile = p!;

  const confirmLogout = () => {
    Alert.alert('Log out?', 'You can log back in any time.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
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
        <Text style={styles.title}>Profile</Text>

        {/* Identity card */}
        <Card style={styles.identity}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.sub}>
            {goalLabel(profile.goal)} · {profile.level}
          </Text>
          <View style={styles.identityStats}>
            <IdStat value={`${profile.weightKg}`} label="kg" />
            <View style={styles.idDivider} />
            <IdStat value={`${profile.heightCm}`} label="cm" />
            <View style={styles.idDivider} />
            <IdStat value={`${profile.daysPerWeek}x`} label="per week" />
          </View>
        </Card>

        {/* Goals */}
        <Text style={styles.sectionTitle}>Your goals</Text>
        <Card>
          <InfoRow icon="flag" label="Main goal" value={goalLabel(profile.goal)} />
          <Sep />
          <InfoRow icon="speedometer" label="Fitness level" value={cap(profile.level)} />
          <Sep />
          <InfoRow icon="fitness" label="Equipment" value={equipLabel(profile.equipment)} />
          <Sep />
          <InfoRow
            icon="locate"
            label="Target weight"
            value={`${profile.targetWeightKg} kg`}
          />
        </Card>

        {/* Settings */}
        <Text style={styles.sectionTitle}>Settings</Text>
        <Card>
          <View style={styles.toggleRow}>
            <View style={styles.rowLeft}>
              <View style={styles.rowIcon}>
                <Ionicons name="notifications" size={18} color={colors.primary} />
              </View>
              <Text style={styles.rowLabel}>Workout reminders</Text>
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
              <Text style={styles.rowLabel}>Units</Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={styles.rowValue}>
                {settings.units === 'metric' ? 'Metric (kg)' : 'Imperial (lb)'}
              </Text>
              <Ionicons name="swap-horizontal" size={18} color={colors.textFaint} />
            </View>
          </TouchableOpacity>
        </Card>

        {/* Account */}
        <TouchableOpacity style={styles.resetBtn} onPress={confirmLogout}>
          <Ionicons name="log-out-outline" size={18} color={colors.danger} />
          <Text style={styles.resetText}>Log out</Text>
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
