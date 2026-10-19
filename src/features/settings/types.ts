/**
 * Tipos de configuración del usuario.
 *
 * Fuente: `.github/specs/data.model-spec.md` y `.github/specs/hu-005-settings.md`.
 * Módulo puro: sin dependencias de React, Expo ni React Native.
 */

/** Parámetros configurables del Pomodoro. Duraciones en minutos. */
export interface UserSettings {
  /** Duración de la fase de estudio (min). */
  studyDuration: number;
  /** Duración del descanso corto (min). */
  shortBreakDuration: number;
  /** Duración del descanso largo (min). */
  longBreakDuration: number;
  /** Pomodoros de estudio antes de un descanso largo. */
  pomodorosPerCycle: number;
}

/** Valores por defecto establecidos en el spec de modelo de datos. */
export const DEFAULT_USER_SETTINGS: UserSettings = {
  studyDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  pomodorosPerCycle: 4,
};

/** Campos configurables, útil para iterar en la UI y en la validación. */
export const USER_SETTINGS_FIELDS = [
  'studyDuration',
  'shortBreakDuration',
  'longBreakDuration',
  'pomodorosPerCycle',
] as const;

export type UserSettingsField = (typeof USER_SETTINGS_FIELDS)[number];
