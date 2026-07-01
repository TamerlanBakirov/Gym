import { Redirect } from 'expo-router';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useApp } from '../src/store/AppContext';
import { colors } from '../src/theme';

/** Entry gate: route to auth, onboarding, or the main app based on session state. */
export default function Index() {
  const { ready, authenticated, hasOnboarded } = useApp();

  if (!ready) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center' }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!authenticated) return <Redirect href="/auth" />;
  if (!hasOnboarded) return <Redirect href="/onboarding" />;
  return <Redirect href="/(tabs)" />;
}
