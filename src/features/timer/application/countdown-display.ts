/**
 * Puerto de visualización del contador en vivo (HU-007).
 *
 * La aplicación pide mostrar/ocultar el contador persistente; la infraestructura
 * lo implementa con la notificación en primer plano. El dominio no participa:
 * el tiempo sigue siendo `endTimestamp - Date.now()`.
 */

import { TimerPhase } from '../types';

export interface CountdownDisplay {
  /** Muestra/actualiza la notificación persistente para el fin de fase indicado. */
  show(endTimestamp: number, phase: TimerPhase): Promise<void>;
  /** Oculta la notificación persistente (pausa/reinicio/fin). */
  hide(): Promise<void>;
}

/** Implementación neutra: no hace nada (tests, plataformas sin servicio). */
export const noopCountdownDisplay: CountdownDisplay = {
  show: async () => {},
  hide: async () => {},
};

/** Texto de la notificación según la fase en curso. */
export function countdownNotification(phase: TimerPhase): { title: string; body: string } {
  switch (phase) {
    case TimerPhase.Study:
      return { title: 'Enfoque en curso', body: 'Tiempo restante de estudio' };
    case TimerPhase.ShortBreak:
      return { title: 'Descanso corto', body: 'Tiempo restante de descanso' };
    case TimerPhase.LongBreak:
      return { title: 'Descanso largo', body: 'Tiempo restante de descanso' };
  }
}
