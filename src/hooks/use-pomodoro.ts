/**
 * Hook de presentación del temporizador Pomodoro.
 *
 * Expone el estado y las acciones de control (HU-001). La UI no conoce los
 * managers: solo este hook.
 */

import { usePomodoroContext } from '@/providers/pomodoro-provider';
import type { SessionState } from '@/features/timer/types';

export interface UsePomodoroResult {
  state: SessionState;
  ready: boolean;
  /** `false` si el sistema no permite alarmas exactas (HU-004). */
  exactAlarmsOk: boolean;
  start(): void;
  pause(): void;
  resume(): void;
  reset(): void;
  /** Abre el ajuste de sistema para conceder alarmas exactas. */
  requestExactAlarmsPermission(): Promise<void>;
}

export function usePomodoro(): UsePomodoroResult {
  const {
    state,
    ready,
    exactAlarmsOk,
    start,
    pause,
    resume,
    reset,
    requestExactAlarmsPermission,
  } = usePomodoroContext();
  return {
    state,
    ready,
    exactAlarmsOk,
    start,
    pause,
    resume,
    reset,
    requestExactAlarmsPermission,
  };
}
