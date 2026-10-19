import { Link, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { colors, spacing, typography } from '@/design-system/tokens';
import { PomodoroProvider, usePomodoroContext } from '@/providers/pomodoro-provider';

SplashScreen.preventAutoHideAsync();

function SettingsLink() {
  return (
    <Link href="/settings" asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Abrir ajustes"
        hitSlop={spacing.md}
        style={({ pressed }) => [styles.headerButton, pressed && styles.headerButtonPressed]}>
        <Text style={styles.headerButtonLabel}>Ajustes</Text>
      </Pressable>
    </Link>
  );
}

function RootNavigator() {
  const { ready } = usePomodoroContext();

  useEffect(() => {
    if (ready) {
      void SplashScreen.hideAsync();
    }
  }, [ready]);

  if (!ready) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.primary,
        headerTitleStyle: { fontWeight: '600' },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}>
      <Stack.Screen
        name="index"
        options={{ title: 'Academia Cotopaxi', headerRight: () => <SettingsLink /> }}
      />
      <Stack.Screen name="settings" options={{ title: 'Ajustes' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PomodoroProvider>
        <StatusBar style="dark" />
        <RootNavigator />
      </PomodoroProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  headerButtonPressed: {
    opacity: 0.6,
  },
  headerButtonLabel: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
});
