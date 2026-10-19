import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { scheduleNotificationAsync } from 'expo-notifications/build/scheduleNotificationAsync';
import { setNotificationChannelAsync } from 'expo-notifications/build/setNotificationChannelAsync';
import { getAllScheduledNotificationsAsync } from 'expo-notifications/build/getAllScheduledNotificationsAsync';
import { setNotificationHandler } from 'expo-notifications/build/NotificationsHandler';
import { setNotificationCategoryAsync } from 'expo-notifications/build/setNotificationCategoryAsync';

import {
  AndroidAudioContentType,
  AndroidAudioUsage,
  AndroidImportance,
} from 'expo-notifications/build/NotificationChannelManager.types';
import { ExpoNotificationService, PHASE_CHANNEL_ID, PHASE_CATEGORY_ID, STOP_ACTION_ID } from '../notification-service';

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    executionEnvironment: 'storeClient',
    expoGoConfig: {},
  },
  ExecutionEnvironment: {
    StoreClient: 'storeClient',
  },
}));
jest.mock('expo-notifications/build/NotificationPermissions', () => ({
  getPermissionsAsync: jest.fn(async () => ({ granted: true })),
  requestPermissionsAsync: jest.fn(async () => ({ granted: true })),
}));
jest.mock('expo-notifications/build/setNotificationChannelAsync', () => ({
  setNotificationChannelAsync: jest.fn(async () => null),
}));
jest.mock('expo-notifications/build/setNotificationCategoryAsync', () => ({
  setNotificationCategoryAsync: jest.fn(async () => null),
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
  getAllScheduledNotificationsAsync: jest.fn(async () => []),
}));
jest.mock('expo-notifications/build/NotificationsHandler', () => ({
  setNotificationHandler: jest.fn(),
}));

const channelMock = setNotificationChannelAsync as jest.Mock;
const scheduleMock = scheduleNotificationAsync as jest.Mock;
const listScheduledMock = getAllScheduledNotificationsAsync as jest.Mock;
const categoryMock = setNotificationCategoryAsync as jest.Mock;

describe('ExpoNotificationService', () => {
  const originalExpoGoConfig = Constants.expoGoConfig;
  const originalExecutionEnvironment = Constants.executionEnvironment;
  const originalPlatform = Platform.OS;
  const originalWarn = console.warn;

  beforeEach(() => {
    Object.defineProperty(Constants, 'executionEnvironment', {
      configurable: true,
      value: 'storeClient',
    });
    Object.defineProperty(Constants, 'expoGoConfig', {
      configurable: true,
      value: {},
    });
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'android' });
    jest.clearAllMocks();
  });

  afterEach(() => {
    Object.defineProperty(Constants, 'executionEnvironment', {
      configurable: true,
      value: originalExecutionEnvironment,
    });
    Object.defineProperty(Constants, 'expoGoConfig', {
      configurable: true,
      value: originalExpoGoConfig,
    });
    Object.defineProperty(Platform, 'OS', { configurable: true, value: originalPlatform });
    console.warn = originalWarn;
  });

  it('usa el canal predeterminado en Expo Go', async () => {
    const service = new ExpoNotificationService();

    await service.configure();
    await service.scheduleAtDate({ date: 10_000, title: 'Fin', body: 'Terminó la fase' });

    expect(setNotificationHandler).toHaveBeenCalledTimes(1);
    expect(channelMock).not.toHaveBeenCalled();
    expect(scheduleMock.mock.calls[0][0].trigger).toEqual({
      type: 'date',
      date: 10_000,
    });
  });

  it('crea el canal en un build nativo y lo asigna a la notificación', async () => {
    Object.defineProperty(Constants, 'executionEnvironment', {
      configurable: true,
      value: 'standalone',
    });
    Object.defineProperty(Constants, 'expoGoConfig', { configurable: true, value: null });
    const service = new ExpoNotificationService();

    await service.configure();
    await service.scheduleAtDate({ date: 10_000, title: 'Fin', body: 'Terminó la fase' });

    expect(channelMock).toHaveBeenCalledWith(
      PHASE_CHANNEL_ID,
      expect.objectContaining({
        name: 'Pomodoro',
        importance: AndroidImportance.MAX,
        sound: 'default',
        audioAttributes: {
          usage: AndroidAudioUsage.ALARM,
          contentType: AndroidAudioContentType.SONIFICATION,
        },
        enableVibrate: true,
      }),
    );
    expect(categoryMock).toHaveBeenCalledWith(
      PHASE_CATEGORY_ID,
      expect.arrayContaining([
        expect.objectContaining({
          identifier: STOP_ACTION_ID,
          buttonTitle: 'Detener',
        }),
      ]),
    );

    expect(scheduleMock.mock.calls[0][0].content.categoryIdentifier).toBe(PHASE_CATEGORY_ID);
    expect(scheduleMock.mock.calls[0][0].trigger.channelId).toBe(PHASE_CHANNEL_ID);
  });

  it('continúa con el canal predeterminado si el proveedor nativo no está disponible', async () => {
    Object.defineProperty(Constants, 'executionEnvironment', {
      configurable: true,
      value: 'standalone',
    });
    Object.defineProperty(Constants, 'expoGoConfig', { configurable: true, value: null });
    channelMock.mockRejectedValueOnce(new Error('channel provider unavailable'));
    const warn = jest.fn();
    console.warn = warn;
    const service = new ExpoNotificationService();

    await expect(service.configure()).resolves.toBeUndefined();
    await service.scheduleAtDate({ date: 10_000, title: 'Fin', body: 'Terminó la fase' });

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('Se usará el canal predeterminado de Android'),
      expect.any(Error),
    );
    expect(scheduleMock.mock.calls[0][0].trigger.channelId).toBeUndefined();
  });

  it('enumera los identificadores de avisos programados', async () => {
    listScheduledMock.mockResolvedValueOnce([
      { identifier: 'a' },
      { identifier: 'b' },
    ]);
    const service = new ExpoNotificationService();

    await expect(service.listScheduled()).resolves.toEqual(['a', 'b']);
  });

  it('delega la gestión de alarmas exactas en ExactAlarmPermission', async () => {
    const exactAlarms = {
      canSchedule: jest.fn(async () => false),
      request: jest.fn(async () => undefined),
    };
    const service = new ExpoNotificationService(exactAlarms);

    await expect(service.canScheduleExactAlarms()).resolves.toBe(false);
    await service.requestExactAlarmsPermission();

    expect(exactAlarms.canSchedule).toHaveBeenCalledTimes(1);
    expect(exactAlarms.request).toHaveBeenCalledTimes(1);
  });

  it('degrada sin lanzar si la gestión de alarmas exactas falla', async () => {
    const exactAlarms = {
      canSchedule: jest.fn(async () => {
        throw new Error('check failed');
      }),
      request: jest.fn(async () => {
        throw new Error('request failed');
      }),
    };
    const service = new ExpoNotificationService(exactAlarms);

    await expect(service.canScheduleExactAlarms()).resolves.toBe(true);
    await expect(service.requestExactAlarmsPermission()).resolves.toBeUndefined();
  });
});