/**
 * Puente tipado hacia el módulo nativo local `PomodoroCountdown` (HU-007/HU-004).
 *
 * `requireOptionalNativeModule` devuelve `null` cuando el módulo no está
 * presente (Expo Go, web, tests). En ese caso la app degrada a no-op y nunca
 * lanza al consumir este puente.
 */

import { requireOptionalNativeModule } from 'expo-modules-core';

/** API expuesta por el módulo nativo. */
export interface PomodoroCountdownNativeModule {
  /** Arranca/actualiza la notificación persistente con cuenta atrás. */
  start(endTimestamp: number, title: string, body: string): Promise<void>;
  /** Detiene la notificación persistente. */
  stop(): Promise<void>;
  /** ¿Está el servicio en primer plano activo? */
  isRunning(): Promise<boolean>;
  /** ¿Tenemos permiso de alarmas exactas (Android 12+)? */
  canScheduleExactAlarms(): Promise<boolean>;
  /** Abre el ajuste de sistema para conceder el permiso de alarmas exactas. */
  requestExactAlarmPermission(): Promise<void>;
}

function load(): PomodoroCountdownNativeModule | null {
  try {
    return requireOptionalNativeModule<PomodoroCountdownNativeModule>('PomodoroCountdown');
  } catch {
    return null;
  }
}

export const pomodoroCountdownNative = load();
