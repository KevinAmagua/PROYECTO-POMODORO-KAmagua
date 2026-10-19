/**
 * Tipos de dominio del temporizador Pomodoro.
 *
 * Fuente: `.github/specs/data.model-spec.md` y `.github/specs/timer-engine-spec.md`.
 * Este módulo es puro: no importa React, Expo ni React Native.
 */

/** Fases del ciclo Pomodoro. */
export enum TimerPhase {
  Study = 'STUDY',
  ShortBreak = 'SHORT_BREAK',
  LongBreak = 'LONG_BREAK',
}

/** Estado del temporizador. */
export enum SessionStatus {
  Idle = 'IDLE',
  Running = 'RUNNING',
  Paused = 'PAUSED',
  Finished = 'FINISHED',
}

/** Estado en memoria de la sesión (vista derivada). */
export interface SessionState {
  currentPhase: TimerPhase;
  status: SessionStatus;
  /** Segundos restantes. Solo es significativo cuando `status === PAUSED`. */
  remainingTime: number;
  completedPomodoros: number;
}

/**
 * Configuración del motor, con duraciones en **segundos**.
 * Se construye a partir de `UserSettings` (minutos) en la capa de aplicación,
 * de modo que el dominio no depende del feature de configuración.
 */
export interface TimerConfig {
  studySeconds: number;
  shortBreakSeconds: number;
  longBreakSeconds: number;
  /** Pomodoros de estudio antes de un descanso largo (>= 1). */
  pomodorosPerCycle: number;
}

/**
 * Sesión persistida en AsyncStorage.
 *
 * Es la fuente de verdad para HU-003: el tiempo restante siempre se recalcula
 * con `sessionEndTimestamp - Date.now()`, nunca con `setInterval`.
 */
export interface PersistentSession {
  /** Inicio de la fase actual (epoch ms). */
  sessionStartTimestamp: number;
  /** Fin previsto de la fase actual (epoch ms). Autoridad del tiempo. */
  sessionEndTimestamp: number;
  /** Última escritura en storage (epoch ms). */
  lastSavedTimestamp: number;
  currentPhase: TimerPhase;
  status: SessionStatus;
  /** Segundos restantes cuando la sesión está en pausa. */
  remainingTime: number;
  completedPomodoros: number;
  /** Versión del esquema para migraciones futuras. */
  schemaVersion: number;
}

/** Versión actual del esquema de `PersistentSession`. */
export const SESSION_SCHEMA_VERSION = 1;
