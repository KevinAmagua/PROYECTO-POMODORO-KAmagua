/**
 * Screen — contenedor base de pantalla: fondo institucional, área segura y
 * padding lateral coherente.
 *
 * No incluye el borde superior porque las pantallas usan el header del Stack.
 */

import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing } from '../tokens';

export interface ScreenProps {
  children: ReactNode;
}

export function Screen({ children }: ScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
      <View style={styles.content}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
});
