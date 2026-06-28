import { Redirect } from 'expo-router';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useApp } from '../src/store/AppContext';
import { colors } from '../src/theme';

/** Entry gate: route to onboarding or the main app based on stored state. */
export default function Index() {
  const { state, ready } = useApp();

  if (!ready) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center' }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return <Redirect href={state.hasOnboarded ? '/(tabs)' : '/onboarding'} />;
}
