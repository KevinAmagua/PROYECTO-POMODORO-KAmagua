/**
 * Card — superficie de vidrio (glassmorfismo) para agrupar contenido sobre el
 * fondo.
 *
 * BlurView desenfoca el fondo del `Screen` (en Android vía `BlurTargetView`);
 * el velo `glass.surface` (blanco, alfa ≥ 0.78) garantiza contraste AA para
 * `text` y `textSecondary` sobre el vidrio. Borde hairline y sombra suave
 * derivados de la paleta oficial.
 */

import { BlurView } from 'expo-blur';
import type { ReactNode } from 'react';
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { glass, radius, spacing } from '../tokens';
import { useGlassBackdrop } from './glass-backdrop';

export interface CardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function Card({ children, style }: CardProps) {
  const backdropRef = useGlassBackdrop();

  return (
    <View style={[styles.frame, style]}>
      <BlurView
        intensity={glass.blurIntensity}
        tint="light"
        style={StyleSheet.absoluteFill}
        {...(Platform.OS === 'android'
          ? { blurTarget: backdropRef ?? undefined, blurMethod: 'dimezisBlurView' as const }
          : {})}
      />
      <View style={styles.veil} importantForAccessibility="no" />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: glass.border,
    overflow: 'hidden',
    shadowColor: glass.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 4,
  },
  veil: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: glass.surface,
  },
  content: {
    padding: spacing.lg,
  },
});
