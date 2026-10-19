/**
 * Etiquetas en español de las fases y estados del temporizador.
 *
 * Viven en la capa de aplicación (no en el dominio puro) y las comparten los
 * avisos (HU-004) y la interfaz (HU-001).
 */

import { SessionStatus, TimerPhase } from '../types';

/** Nombre legible de la fase actual. */
export function phaseLabel(phase: TimerPhase): string {
  switch (phase) {
    case TimerPhase.Study:
      return 'Estudio';
    case TimerPhase.ShortBreak:
      return 'Descanso corto';
    case TimerPhase.LongBreak:
      return 'Descanso largo';
  }
}

/** Texto del estado del temporizador para la pantalla principal. */
export function statusLabel(status: SessionStatus): string {
  switch (status) {
    case SessionStatus.Idle:
      return 'Listo para comenzar';
    case SessionStatus.Running:
      return 'En curso';
    case SessionStatus.Paused:
      return 'En pausa';
    case SessionStatus.Finished:
      return 'Fase completada';
  }
}
