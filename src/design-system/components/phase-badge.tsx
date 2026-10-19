/**
 * PhaseBadge — píldora que identifica la fase actual.
 *
 * El estado se comunica con texto (no solo color), como exige el skill de
 * accesibilidad.
 */

import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../tokens';

export type PhaseBadgeTone = 'primary' | 'secondary';

export interface PhaseBadgeProps {
  label: string;
  tone?: PhaseBadgeTone;
}

export function PhaseBadge({ label, tone = 'primary' }: PhaseBadgeProps) {
  const isPrimary = tone === 'primary';
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: isPrimary ? colors.primary : colors.secondary },
      ]}>
      <Text
        style={[styles.label, { color: isPrimary ? colors.primaryContrast : colors.secondaryContrast }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'center',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  label: {
    ...typography.body,
    fontWeight: '600',
  },
});
