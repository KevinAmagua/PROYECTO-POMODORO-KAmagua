/**
 * Punto de entrada de la capa de aplicación del temporizador.
 */

export { timerConfigFromSettings } from './config';
export { TimerManager, defaultScheduler } from './timer-manager';
export type { TimerManagerOptions, TimerListener, Scheduler } from './timer-manager';
export { SessionManager } from './session-manager';
export type { SessionManagerOptions, RestoreResult } from './session-manager';
export type { SessionStore } from './session-store';
export { noopPhaseAlarm, phaseNotification } from './phase-alarm';
export type { PhaseAlarm, PhaseAlarmPayload } from './phase-alarm';
export { phaseLabel, statusLabel } from './labels';
