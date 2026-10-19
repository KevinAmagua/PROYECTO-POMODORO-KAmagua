/**
 * Punto de entrada de la infraestructura de persistencia local.
 */

export type { KeyValueStore } from './key-value-store';
export { asyncStorageAdapter } from './async-storage-adapter';
export { SessionRepository } from './session-repository';
export { SettingsRepository } from './settings-repository';
export {
  isSessionStatus,
  isTimerPhase,
  parseSession,
  parseUserSettings,
  serializeSession,
  serializeUserSettings,
} from './serialization';
