/**
 * Mapeo entre la configuración del usuario (minutos) y la configuración del
 * motor (segundos). Vive en la capa de aplicación para que el dominio no
 * dependa del feature de settings.
 */

import { minutesToSeconds } from '../domain';
import type { TimerConfig } from '../types';
import type { UserSettings } from '../../settings/types';

/** Construye la configuración del motor a partir de `UserSettings`. */
export function timerConfigFromSettings(settings: UserSettings): TimerConfig {
  return {
    studySeconds: minutesToSeconds(settings.studyDuration),
    shortBreakSeconds: minutesToSeconds(settings.shortBreakDuration),
    longBreakSeconds: minutesToSeconds(settings.longBreakDuration),
    pomodorosPerCycle: Math.max(1, Math.floor(settings.pomodorosPerCycle)),
  };
}
