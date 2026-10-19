/**
 * TextField — campo de texto con etiqueta y mensaje de error accesible.
 *
 * Pensado para entradas numéricas de la pantalla de ajustes (HU-005).
 */

import { StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, radius, size, spacing, typography } from '../tokens';

export interface TextFieldProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  /** Mensaje de error; cuando existe, el campo se marca como inválido. */
  error?: string;
  placeholder?: string;
  keyboardType?: 'default' | 'number-pad';
  accessibilityHint?: string;
}

export function TextField({
  label,
  value,
  onChangeText,
  error,
  placeholder,
  keyboardType = 'number-pad',
  accessibilityHint,
}: TextFieldProps) {
  const hasError = Boolean(error);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        accessibilityHint={accessibilityHint}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        keyboardType={keyboardType}
        inputMode="numeric"
        style={[styles.input, hasError && styles.inputError]}
      />
      {hasError ? (
        <Text accessibilityLiveRegion="polite" style={styles.error}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  input: {
    minHeight: size.touchTarget,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background,
    color: colors.text,
    ...typography.body,
  },
  inputError: {
    borderColor: colors.error,
  },
  error: {
    ...typography.caption,
    color: colors.error,
  },
});
