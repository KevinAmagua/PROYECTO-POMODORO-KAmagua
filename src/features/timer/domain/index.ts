/**
 * Punto de entrada del dominio del temporizador Pomodoro.
 * Re-exporta la API pública para que la capa de aplicación no dependa de
 * rutas internas. Módulo puro.
 */

export {
  SECONDS_PER_MINUTE,
  MILLISECONDS_PER_SECOND,
  minutesToSeconds,
  millisecondsFromSeconds,
  formatDuration,
  remainingSeconds,
  isExpired,
} from './countdown';

export {
  phaseDurationSeconds,
  isBreak,
  nextPhase,
} from './phase-controller';

export { PomodoroEngine } from './pomodoro-engine';
export type { PomodoroEngineOptions, PhaseCompletion } from './pomodoro-engine';
