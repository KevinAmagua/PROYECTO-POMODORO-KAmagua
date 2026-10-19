/**
 * Puerto de alarma de fin de fase (HU-004).
 *
 * La aplicación programa/cancela el aviso a través de este puerto; la
 * infraestructura (`AlarmService`) lo implementa con `expo-notifications`.
 */

import { TimerPhase } from '../types';

/** Contenido textual del aviso de fin de fase. */
export interface PhaseAlarmPayload {
  title: string;
  body: string;
}

export interface PhaseAlarm {
  /** Programa el aviso para el instante indicado (epoch ms). */
  schedule(endTimestamp: number, payload: PhaseAlarmPayload): Promise<void>;
  /** Cancela cualquier aviso pendiente. */
  cancel(): Promise<void>;
}

/** Implementación neutra: no hace nada (tests, plataformas sin avisos). */
export const noopPhaseAlarm: PhaseAlarm = {
  schedule: async () => {},
  cancel: async () => {},
};

/** Textos del aviso según la fase que está terminando. */
export function phaseNotification(phase: TimerPhase): PhaseAlarmPayload {
  switch (phase) {
    case TimerPhase.Study:
      return {
        title: '¡Pomodoro completado!',
        body: 'Es hora de tomar un descanso.',
      };
    case TimerPhase.ShortBreak:
      return {
        title: 'Descanso terminado',
        body: 'Es hora de volver al estudio.',
      };
    case TimerPhase.LongBreak:
      return {
        title: 'Descanso largo terminado',
        body: 'Empecemos un nuevo ciclo de estudio.',
      };
  }
}
