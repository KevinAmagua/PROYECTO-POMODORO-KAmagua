/**
 * PomodoroDots — indicador del progreso del ciclo (● ● ● ●).
 *
 * Completado = dorado institucional; pendiente = gris neutro. Se anuncia por
 * `accessibilityLabel` para no depender solo del color.
 */

import { StyleSheet, View } from 'react-native';

import { colors, spacing } from '../tokens';

export interface PomodoroDotsProps {
  /** Pomodoros que componen el ciclo (>= 1). */
  total: number;
  /** Pomodoros completados en el ciclo. */
  completed: number;
}

export function PomodoroDots({ total, completed }: PomodoroDotsProps) {
  const safeTotal = Math.max(1, Math.floor(total));
  const safeCompleted = Math.min(safeTotal, Math.max(0, Math.floor(completed)));
  const dots = Array.from({ length: safeTotal }, (_, index) => index);

  return (
    <View
      style={styles.row}
      accessible
      accessibilityRole="image"
      accessibilityLabel={`${safeCompleted} de ${safeTotal} pomodoros completados`}>
      {dots.map((index) => (
        <View
          key={index}
          importantForAccessibility="no"
          style={[
            styles.dot,
            { backgroundColor: index < safeCompleted ? colors.pomodoroCompleted : colors.pomodoroPending },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
});
