/**
 * Claves de persistencia local (AsyncStorage).
 *
 * Fuente: `.github/specs/storage-spec.md`.
 * Toda lectura/escritura de la app debe referenciar estas constantes para
 * evitar cadenas mágicas y garantizar consistencia.
 */

export const STORAGE_KEYS = {
  /** Configuración del usuario (`UserSettings`). */
  userSettings: 'user_settings',
  /** Sesión activa (`PersistentSession`) para restaurar tras cerrar la app. */
  activeSession: 'active_session',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
