/**
 * NotificationService — capa de infraestructura sobre `expo-notifications`.
 *
 * Responsabilidades:
 *  - configurar el handler de primer plano y el canal de Android,
 *  - gestionar permisos de notificación,
 *  - programar/cancelar avisos locales (solo locales: sin push ni red).
 *
 * La capa de aplicación depende de la interfaz `NotificationService`, no de la
 * implementación ni de `expo-notifications` directamente.
 *
 * Por qué imports profundos (`expo-notifications/build/...`) y no el índice raíz:
 * el índice re-exporta `./topicSubscription`, que en Android ejecuta
 * `requireNativeModule('ExpoTopicSubscriptionModule')`. Ese módulo nativo es de
 * **push por temas (FCM)** y no existe en Expo Go (SDK 53+), por lo que importar
 * el índice raíz rompe el arranque. Como esta app solo usa **notificaciones
 * locales** (offline), se importan únicamente los submódulos locales, cuyos
 * módulos nativos sí están presentes tanto en Expo Go como en un build real.
 */

import { setNotificationHandler } from 'expo-notifications/build/NotificationsHandler';
import {
  getPermissionsAsync,
  requestPermissionsAsync,
} from 'expo-notifications/build/NotificationPermissions';
import { setNotificationChannelAsync } from 'expo-notifications/build/setNotificationChannelAsync';
import { setNotificationCategoryAsync } from 'expo-notifications/build/setNotificationCategoryAsync';
import { scheduleNotificationAsync } from 'expo-notifications/build/scheduleNotificationAsync';
import { cancelScheduledNotificationAsync } from 'expo-notifications/build/cancelScheduledNotificationAsync';
import { cancelAllScheduledNotificationsAsync } from 'expo-notifications/build/cancelAllScheduledNotificationsAsync';
import { getAllScheduledNotificationsAsync } from 'expo-notifications/build/getAllScheduledNotificationsAsync';
import {
  AndroidNotificationPriority,
  SchedulableTriggerInputTypes,
} from 'expo-notifications/build/Notifications.types';
import {
  AndroidAudioContentType,
  AndroidAudioUsage,
  AndroidImportance,
  AndroidNotificationVisibility,
} from 'expo-notifications/build/NotificationChannelManager.types';
import type { NotificationAction, NotificationBehavior } from 'expo-notifications/build/Notifications.types';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';

import { pomodoroCountdownNative } from './pomodoro-countdown-native';

/**
 * Identificador del canal de Android.
 *
 * Nota (AC-9): se usa `pomodoro-alarm` (id **nuevo**) porque los canales de
 * Android son inmutables; reciclar el id antiguo impediría aplicar el audio de
 * alarma y la vibración a instalaciones que ya tenían el canal creado.
 */
export const PHASE_CHANNEL_ID = 'pomodoro-alarm';

/** Categoría que agrupa las acciones del aviso de fin de fase (AC-10). */
export const PHASE_CATEGORY_ID = 'pomodoroPhase';

/** Identificador de la acción "Detener" del aviso. */
export const STOP_ACTION_ID = 'stop';

/** Patrón de vibración (espera, vibra, pausa, vibra, ...) en milisegundos. */
export const VIBRATION_PATTERN = [0, 250, 250, 250];

/** Color institucional (Cotopaxi Blue) para el acento de la notificación. */
const NOTIFICATION_ACCENT = '#1E1F6E';

/**
 * Acción "Detener" del aviso (AC-10). `opensAppToForeground` abre la app al
 * pulsarla (AC-11); no requiere tarea en segundo plano.
 */
const STOP_ACTION: NotificationAction = {
  identifier: STOP_ACTION_ID,
  buttonTitle: 'Detener',
  options: { opensAppToForeground: true },
};

/** Comportamiento del aviso cuando la app está en primer plano. */
const FOREGROUND_BEHAVIOR: NotificationBehavior = {
  shouldShowBanner: true,
  shouldShowList: true,
  shouldPlaySound: true,
  shouldSetBadge: false,
};

export interface ScheduleAtDateOptions {
  /** Instante (epoch ms) en que debe dispararse el aviso. */
  date: number;
  title: string;
  body: string;
}

export interface NotificationService {
  /** Configura handler y canal. Debe llamarse antes de pedir permisos. */
  configure(): Promise<void>;
  /** ¿La app ya tiene permiso para mostrar notificaciones? */
  hasPermissions(): Promise<boolean>;
  /** Solicita permisos de notificación; devuelve si quedaron concedidos. */
  requestPermissions(): Promise<boolean>;
  /** Programa un aviso para una fecha exacta; devuelve el identificador. */
  scheduleAtDate(options: ScheduleAtDateOptions): Promise<string>;
  /** Cancela un aviso programado por su identificador. */
  cancelScheduled(identifier: string): Promise<void>;
  /** Cancela todos los avisos programados. */
  cancelAllScheduled(): Promise<void>;
  /** ¿Tenemos permiso de alarmas exactas (Android 12+)? */
  canScheduleExactAlarms(): Promise<boolean>;
  /** Abre el ajuste de sistema para conceder las alarmas exactas. */
  requestExactAlarmsPermission(): Promise<void>;
  /** Identificadores de los avisos actualmente registrados en el sistema. */
  listScheduled(): Promise<string[]>;
}

export class ExpoNotificationService implements NotificationService {
  private channelConfigured = false;

  async configure(): Promise<void> {
    setNotificationHandler({
      handleNotification: async () => FOREGROUND_BEHAVIOR,
    });

    // Android 8+: el canal es obligatorio y debe existir antes de pedir permisos.
    if (Platform.OS === 'android') {
      this.channelConfigured = false;
      if (
        Constants.executionEnvironment === ExecutionEnvironment.StoreClient &&
        Constants.expoGoConfig !== null
      ) {
        return;
      }

      try {
        await setNotificationChannelAsync(PHASE_CHANNEL_ID, {
          name: 'Pomodoro',
          description: 'Avisos al terminar cada fase de estudio o descanso.',
          importance: AndroidImportance.MAX,
          sound: 'default',
          audioAttributes: {
            usage: AndroidAudioUsage.ALARM,
            contentType: AndroidAudioContentType.SONIFICATION,
          },
          vibrationPattern: VIBRATION_PATTERN,
          enableVibrate: true,
          bypassDnd: true,
          lightColor: NOTIFICATION_ACCENT,
          lockscreenVisibility: AndroidNotificationVisibility.PUBLIC,
        });
        this.channelConfigured = true;
      } catch (error) {
        console.warn(
          'No se pudo crear el canal Pomodoro. Se usará el canal predeterminado de Android; ' +
            'reconstruye el development build si el problema continúa.',
          error,
        );
      }

      try {
        await setNotificationCategoryAsync(PHASE_CATEGORY_ID, [STOP_ACTION]);
      } catch (error) {
        console.warn('No se pudo registrar la acción de la notificación.', error);
      }
    }
  }

  async hasPermissions(): Promise<boolean> {
    const permissions = await getPermissionsAsync();
    return permissions.granted;
  }

  async requestPermissions(): Promise<boolean> {
    const current = await getPermissionsAsync();
    if (current.granted) {
      return true;
    }
    const requested = await requestPermissionsAsync();
    return requested.granted;
  }

  async scheduleAtDate(options: ScheduleAtDateOptions): Promise<string> {
    return scheduleNotificationAsync({
      content: {
        title: options.title,
        body: options.body,
        sound: 'default',
        vibrate: VIBRATION_PATTERN,
        color: NOTIFICATION_ACCENT,
        priority: AndroidNotificationPriority.MAX,
        categoryIdentifier: PHASE_CATEGORY_ID,
      },
      trigger: {
        type: SchedulableTriggerInputTypes.DATE,
        date: options.date,
        ...(this.channelConfigured ? { channelId: PHASE_CHANNEL_ID } : {}),
      },
    });
  }

  async cancelScheduled(identifier: string): Promise<void> {
    await cancelScheduledNotificationAsync(identifier);
  }

  async cancelAllScheduled(): Promise<void> {
    await cancelAllScheduledNotificationsAsync();
  }

  async canScheduleExactAlarms(): Promise<boolean> {
    if (pomodoroCountdownNative === null) {
      return true;
    }
    try {
      return await pomodoroCountdownNative.canScheduleExactAlarms();
    } catch {
      return true;
    }
  }

  async requestExactAlarmsPermission(): Promise<void> {
    if (pomodoroCountdownNative === null) {
      return;
    }
    try {
      await pomodoroCountdownNative.requestExactAlarmPermission();
    } catch {
      // La petición de permiso es best-effort.
    }
  }

  async listScheduled(): Promise<string[]> {
    const scheduled = await getAllScheduledNotificationsAsync();
    return scheduled.map((request) => request.identifier);
  }
}
