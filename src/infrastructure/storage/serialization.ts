/**
 * (De)serialización pura de los datos persistentes.
 *
 * Módulo sin dependencias de AsyncStorage/Expo/React: recibe y devuelve strings
 * y tipos de dominio, de modo que es trivial de testear y nunca lanza por datos
 * corruptos (devuelve `null` o valores por defecto seguros).
 */

import {
  SESSION_SCHEMA_VERSION,
  SessionStatus,
  TimerPhase,
} from '../../features/timer/types';
import type { PersistentSession } from '../../features/timer/types';
import {
  DEFAULT_USER_SETTINGS,
  USER_SETTINGS_FIELDS,
} from '../../features/settings/types';
import type { UserSettings } from '../../features/settings/types';
import { SETTINGS_LIMITS } from '../../features/settings/domain';

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

/** Type guard de `TimerPhase`. */
export function isTimerPhase(value: unknown): value is TimerPhase {
  return (
    value === TimerPhase.Study ||
    value === TimerPhase.ShortBreak ||
    value === TimerPhase.LongBreak
  );
}

/** Type guard de `SessionStatus`. */
export function isSessionStatus(value: unknown): value is SessionStatus {
  return (
    value === SessionStatus.Idle ||
    value === SessionStatus.Running ||
    value === SessionStatus.Paused ||
    value === SessionStatus.Finished
  );
}

/** Serializa una sesión a JSON. */
export function serializeSession(session: PersistentSession): string {
  return JSON.stringify(session);
}

/**
 * Parsea una sesión persistida.
 *
 * Devuelve `null` ante JSON inválido, campos faltantes o `schemaVersion`
 * desconocido (no hay migraciones todavía).
 */
export function parseSession(raw: string | null): PersistentSession | null {
  if (raw === null) {
    return null;
  }
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof value !== 'object' || value === null) {
    return null;
  }

  const candidate = value as Record<string, unknown>;
  if (candidate.schemaVersion !== SESSION_SCHEMA_VERSION) {
    return null;
  }
  if (!isTimerPhase(candidate.currentPhase) || !isSessionStatus(candidate.status)) {
    return null;
  }
  if (
    !isFiniteNumber(candidate.sessionStartTimestamp) ||
    !isFiniteNumber(candidate.sessionEndTimestamp) ||
    !isFiniteNumber(candidate.lastSavedTimestamp) ||
    !isFiniteNumber(candidate.remainingTime) ||
    !isFiniteNumber(candidate.completedPomodoros)
  ) {
    return null;
  }

  return {
    sessionStartTimestamp: candidate.sessionStartTimestamp,
    sessionEndTimestamp: candidate.sessionEndTimestamp,
    lastSavedTimestamp: candidate.lastSavedTimestamp,
    currentPhase: candidate.currentPhase,
    status: candidate.status,
    remainingTime: candidate.remainingTime,
    completedPomodoros: candidate.completedPomodoros,
    schemaVersion: SESSION_SCHEMA_VERSION,
  };
}

/**
 * Parsea `UserSettings` aplicando valores por defecto ante datos ausentes,
 * corruptos o inválidos (HU-005: sin vacíos, negativos ni ceros).
 */
export function parseUserSettings(raw: string | null): UserSettings {
  let value: unknown;
  if (raw !== null) {
    try {
      value = JSON.parse(raw);
    } catch {
      value = undefined;
    }
  }

  const candidate =
    typeof value === 'object' && value !== null
      ? (value as Record<string, unknown>)
      : {};

  const settings = { ...DEFAULT_USER_SETTINGS };
  for (const field of USER_SETTINGS_FIELDS) {
    const rawField = candidate[field];
    const { min, max } = SETTINGS_LIMITS[field];
    if (
      isFiniteNumber(rawField) &&
      Number.isInteger(rawField) &&
      rawField >= min &&
      rawField <= max
    ) {
      settings[field] = rawField;
    }
  }
  return settings;
}

/** Serializa `UserSettings` a JSON. */
export function serializeUserSettings(settings: UserSettings): string {
  return JSON.stringify(settings);
}
