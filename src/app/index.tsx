import { Alert, StyleSheet, Text, View } from 'react-native';

import {
  AppButton,
  Card,
  PhaseBadge,
  PomodoroDots,
  Screen,
} from '@/design-system/components';
import { colors, spacing, timerDisplay, timerNumberVariant, typography } from '@/design-system/tokens';
import { phaseLabel, statusLabel } from '@/features/timer/application';
import { formatDuration, SECONDS_PER_MINUTE } from '@/features/timer/domain';
import { SessionStatus, TimerPhase } from '@/features/timer/types';
import { usePomodoro } from '@/hooks/use-pomodoro';
import { useSettings } from '@/hooks/use-settings';

function controlFor(status: SessionStatus): {
  label: string;
  variant: 'primary' | 'secondary';
  action: 'start' | 'pause' | 'resume';
} {
  switch (status) {
    case SessionStatus.Running:
      return { label: 'Pausar', variant: 'secondary', action: 'pause' };
    case SessionStatus.Paused:
      return { label: 'Reanudar', variant: 'primary', action: 'resume' };
    default:
      return { label: 'Iniciar', variant: 'primary', action: 'start' };
  }
}

export default function HomeScreen() {
  const { state, ready, start, pause, resume, reset, exactAlarmsOk, requestExactAlarmsPermission } =
    usePomodoro();
  const { settings } = useSettings();

  const remainingSeconds = Math.max(0, state.remainingTime);
  const minutes = Math.floor(remainingSeconds / SECONDS_PER_MINUTE);
  const seconds = remainingSeconds % SECONDS_PER_MINUTE;
  const control = controlFor(state.status);
  const canReset = state.status !== SessionStatus.Idle;

  const handleControl = () => {
    if (control.action === 'pause') {
      pause();
    } else if (control.action === 'resume') {
      resume();
    } else {
      start();
    }
  };

  const handleReset = () => {
    Alert.alert(
      'Reiniciar temporizador',
      'Se restablecerá el tiempo de la fase actual. ¿Deseas continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Reiniciar', style: 'destructive', onPress: () => reset() },
      ],
    );
  };

  return (
    <Screen>
      <View style={styles.top}>
        <Card style={styles.timerCard}>
          <PhaseBadge
            label={phaseLabel(state.currentPhase)}
            tone={state.currentPhase === TimerPhase.Study ? 'primary' : 'secondary'}
          />
          <Text
            accessibilityRole="timer"
            accessibilityLabel={`Tiempo restante: ${minutes} minutos con ${seconds} segundos`}
            style={styles.timer}>
            {formatDuration(remainingSeconds)}
          </Text>
          <Text style={styles.status}>{statusLabel(state.status)}</Text>
          <View style={styles.dotsWrapper}>
            <PomodoroDots
              total={settings.pomodorosPerCycle}
              completed={state.completedPomodoros}
            />
          </View>
        </Card>

        {ready && !exactAlarmsOk ? (
          <Card style={styles.warningCard}>
            <Text style={styles.warningTitle}>Activa las alarmas exactas</Text>
            <Text style={styles.warningBody}>
              Para que el aviso suene a la hora exacta, permite las alarmas y recordatorios de
              la app en los ajustes del sistema.
            </Text>
            <AppButton
              label="Abrir ajustes"
              variant="secondary"
              onPress={() => {
                void requestExactAlarmsPermission();
              }}
              accessibilityHint="Abre los ajustes de Android para permitir alarmas exactas"
            />
          </Card>
        ) : null}
      </View>

      <View style={styles.controls}>
        <AppButton
          label={control.label}
          variant={control.variant}
          onPress={handleControl}
          accessibilityHint="Controla la fase de estudio o descanso en curso"
        />
        {canReset ? (
          <AppButton
            label="Reiniciar"
            variant="danger"
            onPress={handleReset}
            accessibilityHint="Vuelve al tiempo inicial de la fase actual"
          />
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: {
    flex: 1,
    justifyContent: 'center',
  },
  timerCard: {
    alignItems: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.xl,
  },
  timer: {
    ...timerDisplay,
    color: colors.primary,
    fontVariant: [...timerNumberVariant],
  },
  status: {
    ...typography.body,
    color: colors.textSecondary,
  },
  dotsWrapper: {
    paddingTop: spacing.xs,
  },
  warningCard: {
    gap: spacing.sm,
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  warningTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  warningBody: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  controls: {
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
});
