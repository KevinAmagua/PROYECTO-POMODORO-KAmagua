/**
 * Validación pura de la configuración del usuario (HU-005).
 *
 * Reglas:
 *  - sin vacíos (NaN/no numérico),
 *  - sin negativos ni cero,
 *  - enteros,
 *  - dentro de un rango razonable.
 *
 * Módulo puro: no importa React, Expo ni React Native.
 */

import { USER_SETTINGS_FIELDS } from '../types';
import type { UserSettings, UserSettingsField } from '../types';

/** Rango razonable por parámetro (min/max inclusivos). */
export const SETTINGS_LIMITS: Record<UserSettingsField, { min: number; max: number }> = {
  studyDuration: { min: 1, max: 180 },
  shortBreakDuration: { min: 1, max: 60 },
  longBreakDuration: { min: 1, max: 120 },
  pomodorosPerCycle: { min: 1, max: 10 },
};

export type SettingsValidationErrors = Partial<Record<UserSettingsField, string>>;

export interface SettingsValidationResult {
  isValid: boolean;
  errors: SettingsValidationErrors;
}

/** Valida un único campo; devuelve el mensaje de error o `null` si es válido. */
export function validateSettingsField(
  field: UserSettingsField,
  value: unknown,
): string | null {
  const { min, max } = SETTINGS_LIMITS[field];
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return `Ingresa un número entero entre ${min} y ${max}.`;
  }
  if (!Number.isInteger(value)) {
    return `Ingresa un número entero entre ${min} y ${max}.`;
  }
  if (value < min || value > max) {
    return `Debe estar entre ${min} y ${max}.`;
  }
  return null;
}

/** Valida todos los parámetros y devuelve el detalle de errores. */
export function validateSettings(settings: UserSettings): SettingsValidationResult {
  const errors: SettingsValidationErrors = {};
  for (const field of USER_SETTINGS_FIELDS) {
    const error = validateSettingsField(field, settings[field]);
    if (error !== null) {
      errors[field] = error;
    }
  }
  return { isValid: Object.keys(errors).length === 0, errors };
}
