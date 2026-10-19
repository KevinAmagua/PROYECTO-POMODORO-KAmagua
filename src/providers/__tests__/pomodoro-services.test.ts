/**
 * Integración del wiring real de la app (Fase 6): settings + storage + alarmas.
 *
 * Usa el mock de AsyncStorage del setup de Jest y mocks de los submódulos de
 * `expo-notifications` para verificar el flujo completo sin red ni dispositivo.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { cancelAllScheduledNotificationsAsync } from 'expo-notifications/build/cancelAllScheduledNotificationsAsync';
import { scheduleNotificationAsync } from 'expo-notifications/build/scheduleNotificationAsync';

import { timerConfigFromSettings } from '@/features/timer/application';
import {
  parseSession,
  parseUserSettings,
  serializeSession,
  serializeUserSettings,
} from '@/infrastructure/storage/serialization';
import { STORAGE_KEYS } from '@/infrastructure/constants/storage-keys';
import { DEFAULT_USER_SETTINGS } from '@/features/settings/types';
import { SESSION_SCHEMA_VERSION, SessionStatus, TimerPhase } from '@/features/timer/types';
import type { PersistentSession } from '@/features/timer/types';

import { createPomodoroServices, type PomodoroServices } from '../pomodoro-services';

// `notification-service.ts` importa `expo-notifications` por submódulos locales
// (evita el módulo de push ausente en Expo Go), así que se mockean esas rutas.
jest.mock('expo-notifications/build/NotificationsHandler', () => ({
  setNotificationHandler: jest.fn(),
}));
jest.mock('expo-notifications/build/NotificationPermissions', () => ({
  getPermissionsAsync: jest.fn(async () => ({ granted: true })),
  requestPermissionsAsync: jest.fn(async () => ({ granted: true })),
}));
jest.mock('expo-notifications/build/setNotificationChannelAsync', () => ({
  setNotificationChannelAsync: jest.fn(async () => null),
}));
jest.mock('expo-notifications/build/scheduleNotificationAsync', () => ({
  scheduleNotificationAsync: jest.fn(async () => 'notification-id'),
}));
jest.mock('expo-notifications/build/cancelScheduledNotificationAsync', () => ({
  cancelScheduledNotificationAsync: jest.fn(async () => undefined),
}));
jest.mock('expo-notifications/build/cancelAllScheduledNotificationsAsync', () => ({
  cancelAllScheduledNotificationsAsync: jest.fn(async () => undefined),
}));
jest.mock('expo-notifications/build/getAllScheduledNotificationsAsync', () => ({
  getAllScheduledNotificationsAsync: jest.fn(async () => [{ identifier: 'notification-id' }]),
}));

const scheduleMock = scheduleNotificationAsync as jest.Mock;
const cancelAllMock = cancelAllScheduledNotificationsAsync as jest.Mock;

let created: PomodoroServices[] = [];

function createServices(): PomodoroServices {
  const services = createPomodoroServices();
  created.push(services);
  return services;
}

function runningSession(endTimestamp: number): PersistentSession {
  return {
    sessionStartTimestamp: endTimestamp - 1_500_000,
    sessionEndTimestamp: endTimestamp,
    lastSavedTimestamp: Date.now(),
    currentPhase: TimerPhase.Study,
    status: SessionStatus.Running,
    remainingTime: 1500,
    completedPomodoros: 2,
    schemaVersion: SESSION_SCHEMA_VERSION,
  };
}

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.clearAllMocks();
});

afterEach(() => {
  for (const services of created) {
    services.session.dispose();
  }
  created = [];
});

describe('createPomodoroServices (integración)', () => {
  it('arranca en reposo con la configuración por defecto', () => {
    const services = createServices();

    expect(services.settings.getSettings()).toEqual(DEFAULT_USER_SETTINGS);
    expect(services.session.getState()).toEqual({
      currentPhase: TimerPhase.Study,
      status: SessionStatus.Idle,
      remainingTime: 1500,
      completedPomodoros: 0,
    });
  });

  it('restaura una sesión en marcha y agenda la alarma en el fin persistido', async () => {
    const end = Date.now() + 60_000;
    await AsyncStorage.setItem(
      STORAGE_KEYS.activeSession,
      serializeSession(runningSession(end)),
    );

    const services = createServices();
    const result = await services.session.restore();

    expect(result.restored).toBe(true);
    expect(result.completion).toBeNull();
    expect(services.session.getState().status).toBe(SessionStatus.Running);
    expect(services.session.getState().completedPomodoros).toBe(2);
    expect(scheduleMock).toHaveBeenCalledTimes(1);
    expect(scheduleMock.mock.calls[0][0].trigger.date).toBe(end);
  });

  it('marca FINISHED sin alarma si la fase expiró con la app cerrada', async () => {
    await AsyncStorage.setItem(
      STORAGE_KEYS.activeSession,
      serializeSession(runningSession(Date.now() - 1_000)),
    );

    const services = createServices();
    const result = await services.session.restore();

    expect(result.completion).toEqual({
      completedPhase: TimerPhase.Study,
      nextPhase: TimerPhase.ShortBreak,
    });
    expect(services.session.getState().status).toBe(SessionStatus.Finished);
    expect(services.session.getState().completedPomodoros).toBe(3);
    expect(scheduleMock).not.toHaveBeenCalled();

    const persisted = parseSession(await AsyncStorage.getItem(STORAGE_KEYS.activeSession));
    expect(persisted?.status).toBe(SessionStatus.Finished);
  });

  it('persiste la sesión al iniciar y cancela la alarma al pausar', async () => {
    const services = createServices();

    await services.session.start();
    const persisted = parseSession(await AsyncStorage.getItem(STORAGE_KEYS.activeSession));
    expect(persisted?.status).toBe(SessionStatus.Running);
    expect(scheduleMock).toHaveBeenCalledTimes(1);

    await services.session.pause();
    expect(cancelAllMock).toHaveBeenCalled();
    const paused = parseSession(await AsyncStorage.getItem(STORAGE_KEYS.activeSession));
    expect(paused?.status).toBe(SessionStatus.Paused);
  });

  it('carga la configuración persistida y la mapea al motor', async () => {
    await AsyncStorage.setItem(
      STORAGE_KEYS.userSettings,
      serializeUserSettings({ ...DEFAULT_USER_SETTINGS, studyDuration: 30 }),
    );

    const services = createServices();
    const loaded = await services.settings.load();

    expect(loaded.studyDuration).toBe(30);
    expect(timerConfigFromSettings(loaded).studySeconds).toBe(1800);
  });

  it('persiste cambios válidos y rechaza los inválidos sin sobrescribir', async () => {
    const services = createServices();

    const valid = await services.settings.update({ shortBreakDuration: 10 });
    expect(valid.ok).toBe(true);
    const stored = parseUserSettings(await AsyncStorage.getItem(STORAGE_KEYS.userSettings));
    expect(stored.shortBreakDuration).toBe(10);

    const invalid = await services.settings.update({ studyDuration: 0 });
    expect(invalid.ok).toBe(false);
    expect(invalid.errors.studyDuration).toBeDefined();
    const stillStored = parseUserSettings(await AsyncStorage.getItem(STORAGE_KEYS.userSettings));
    expect(stillStored.studyDuration).toBe(DEFAULT_USER_SETTINGS.studyDuration);
  });
});
