/**
 * AppButton — botón del design system Academia Cotopaxi.
 *
 * Accesible por defecto: rol de botón, área táctil mínima de 48px y etiqueta
 * textual (nunca depende solo del color).
 */

import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius, size, spacing, typography } from '../tokens';

export type AppButtonVariant = 'primary' | 'secondary' | 'danger';

export interface AppButtonProps {
  label: string;
  onPress: () => void;
  variant?: AppButtonVariant;
  disabled?: boolean;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
}

const VARIANT_STYLES: Record<
  AppButtonVariant,
  { backgroundColor: string; color: string }
> = {
  primary: { backgroundColor: colors.primary, color: colors.primaryContrast },
  secondary: { backgroundColor: colors.secondary, color: colors.secondaryContrast },
  danger: { backgroundColor: colors.error, color: colors.errorContrast },
};

export function AppButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  accessibilityHint,
  style,
}: AppButtonProps) {
  const palette = VARIANT_STYLES[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: palette.backgroundColor },
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}>
      <Text style={[styles.label, { color: palette.color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: size.touchTarget,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.45,
  },
  label: {
    ...typography.body,
    fontWeight: '600',
    textAlign: 'center',
  },
});
