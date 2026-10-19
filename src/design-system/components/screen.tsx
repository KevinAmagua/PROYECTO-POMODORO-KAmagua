/**
 * Screen — contenedor base de pantalla: fondo institucional con decoración
 * tenue de marca (glassmorfismo), área segura y padding lateral coherente.
 *
 * Publica el `BlurTargetView` del fondo mediante `GlassBackdropContext` para
 * que las tarjetas de vidrio lo desenfoquen (Android).
 *
 * No incluye el borde superior porque las pantallas usan el header del Stack.
 */

import { BlurTargetView } from 'expo-blur';
import { useRef, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, glass, radius, spacing } from '../tokens';
import { GlassBackdropContext } from './glass-backdrop';

export interface ScreenProps {
  children: ReactNode;
}

export function Screen({ children }: ScreenProps) {
  const backdropRef = useRef<View | null>(null);

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
      <GlassBackdropContext.Provider value={backdropRef}>
        <BlurTargetView
          ref={backdropRef}
          style={styles.backdrop}
          importantForAccessibility="no"
          accessibilityElementsHidden>
          <View style={[styles.tint, styles.tintBlue]} />
          <View style={[styles.tint, styles.tintGold]} />
        </BlurTargetView>
        <View style={styles.content}>{children}</View>
      </GlassBackdropContext.Provider>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.background,
  },
  tint: {
    position: 'absolute',
    borderRadius: radius.pill,
  },
  tintBlue: {
    width: 320,
    height: 320,
    top: -80,
    right: -60,
    backgroundColor: glass.tintBlue,
  },
  tintGold: {
    width: 260,
    height: 260,
    bottom: 40,
    left: -70,
    backgroundColor: glass.tintGold,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
});
