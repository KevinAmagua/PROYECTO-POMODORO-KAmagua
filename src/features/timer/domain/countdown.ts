/**
 * CountdownCalculator — cálculo puro del tiempo.
 *
 * Implementa la regla crítica de `.github/specs/timer-engine-spec.md`:
 * el tiempo restante se deriva de un timestamp de fin, nunca de un contador.
 *
 * Módulo puro: no importa React, Expo ni React Native.
 */

export const SECONDS_PER_MINUTE = 60;
export const MILLISECONDS_PER_SECOND = 1000;

/** Convierte minutos (config del usuario) a segundos. */
export function minutesToSeconds(minutes: number): number {
  return Math.round(minutes * SECONDS_PER_MINUTE);
}

/** Convierte segundos a milisegundos. */
export function millisecondsFromSeconds(seconds: number): number {
  return Math.max(0, Math.round(seconds)) * MILLISECONDS_PER_SECOND;
}

/**
 * Formatea una cantidad de segundos como `MM:SS` (p. ej. `25:00`).
 * Los valores negativos se normalizan a `0:00`.
 */
export function formatDuration(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeSeconds / SECONDS_PER_MINUTE);
  const seconds = safeSeconds % SECONDS_PER_MINUTE;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Segundos restantes hasta `endTimestamp`.
 * Usa `Math.ceil` para mostrar la duración completa en el instante de inicio
 * y nunca devuelve valores negativos.
 */
export function remainingSeconds(endTimestamp: number, now: number): number {
  return Math.max(0, Math.ceil((endTimestamp - now) / MILLISECONDS_PER_SECOND));
}

/** Indica si ya se alcanzó el timestamp de fin. */
export function isExpired(endTimestamp: number, now: number): boolean {
  return now >= endTimestamp;
}
