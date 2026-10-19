/**
 * PhaseController — reglas de transición entre fases (HU-002).
 *
 * Módulo puro: no importa React, Expo ni React Native.
 *
 * Reglas:
 *  - Tras un estudio → descanso corto.
 *  - Tras completar `pomodorosPerCycle` estudios → descanso largo.
 *  - Tras un descanso (corto o largo) → nuevo estudio.
 */

import { TimerPhase } from '../types';
import type { TimerConfig } from '../types';

/** Mapea cada fase a su duración en la configuración. */
const DURATION_KEY_BY_PHASE: Record<TimerPhase, keyof TimerConfig> = {
  [TimerPhase.Study]: 'studySeconds',
  [TimerPhase.ShortBreak]: 'shortBreakSeconds',
  [TimerPhase.LongBreak]: 'longBreakSeconds',
};

/** Duración en segundos de una fase según la configuración del usuario. */
export function phaseDurationSeconds(config: TimerConfig, phase: TimerPhase): number {
  return config[DURATION_KEY_BY_PHASE[phase]];
}

/** ¿La fase es un descanso? */
export function isBreak(phase: TimerPhase): boolean {
  return phase === TimerPhase.ShortBreak || phase === TimerPhase.LongBreak;
}

/**
 * Decide la siguiente fase del ciclo.
 *
 * @param current Fase que acaba de terminar.
 * @param completedPomodoros Cantidad de pomodoros completados **incluyendo** el
 *   estudio recién terminado (si `current` era `STUDY`).
 * @param pomodorosPerCycle Pomodoros por ciclo (se normaliza a >= 1).
 */
export function nextPhase(
  current: TimerPhase,
  completedPomodoros: number,
  pomodorosPerCycle: number,
): TimerPhase {
  if (current !== TimerPhase.Study) {
    return TimerPhase.Study;
  }
  const perCycle = Math.max(1, Math.floor(pomodorosPerCycle));
  return completedPomodoros >= perCycle ? TimerPhase.LongBreak : TimerPhase.ShortBreak;
}
