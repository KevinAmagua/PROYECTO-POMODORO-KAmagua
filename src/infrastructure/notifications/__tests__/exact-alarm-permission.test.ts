import AsyncStorage from '@react-native-async-storage/async-storage';
import * as IntentLauncher from 'expo-intent-launcher';

import { STORAGE_KEYS } from '@/infrastructure/constants/storage-keys';

import { ExactAlarmPermission } from '../exact-alarm-permission';

describe('ExactAlarmPermission', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  describe('canSchedule()', () => {
    it('devuelve true fuera de Android', async () => {
      const permission = new ExactAlarmPermission({
        platform: { os: 'ios', version: '17.4' },
        packageName: null,
      });

      await expect(permission.canSchedule()).resolves.toBe(true);
    });

    it('devuelve true en Android previo a 14 (permiso concedido por defecto)', async () => {
      const permission = new ExactAlarmPermission({
        platform: { os: 'android', version: 33 },
        packageName: null,
      });

      await expect(permission.canSchedule()).resolves.toBe(true);
    });

    it('devuelve false en Android 14+ antes de completar el flujo de ajustes', async () => {
      const permission = new ExactAlarmPermission({
        platform: { os: 'android', version: 34 },
        packageName: null,
      });

      await expect(permission.canSchedule()).resolves.toBe(false);
    });

    it('devuelve true en Android 14+ tras completar el flujo de ajustes', async () => {
      await AsyncStorage.setItem(STORAGE_KEYS.exactAlarmPermissionRequested, 'true');
      const permission = new ExactAlarmPermission({
        platform: { os: 'android', version: 35 },
        packageName: null,
      });

      await expect(permission.canSchedule()).resolves.toBe(true);
    });
  });

  describe('request()', () => {
    it('abre la pantalla de alarmas exactas con el paquete de la app y registra el flujo', async () => {
      const permission = new ExactAlarmPermission({
        platform: { os: 'android', version: 34 },
        packageName: 'com.academiacotopaxi.pomodoro',
      });

      await permission.request();

      expect(IntentLauncher.startActivityAsync).toHaveBeenCalledWith(
        'android.settings.REQUEST_SCHEDULE_EXACT_ALARM',
        { data: 'package:com.academiacotopaxi.pomodoro' },
      );
      expect(await AsyncStorage.getItem(STORAGE_KEYS.exactAlarmPermissionRequested)).toBe('true');
      await expect(permission.canSchedule()).resolves.toBe(true);
    });

    it('abre la pantalla sin paquete en Expo Go (packageName null)', async () => {
      const openSettingsScreen = jest.fn(async () => undefined);
      const permission = new ExactAlarmPermission({
        platform: { os: 'android', version: 34 },
        packageName: null,
        openSettingsScreen,
      });

      await permission.request();

      expect(openSettingsScreen).toHaveBeenCalledWith(null);
      expect(await AsyncStorage.getItem(STORAGE_KEYS.exactAlarmPermissionRequested)).toBe('true');
    });

    it('no registra el flujo si la pantalla de ajustes no abre', async () => {
      const permission = new ExactAlarmPermission({
        platform: { os: 'android', version: 34 },
        packageName: null,
        openSettingsScreen: jest.fn(async () => {
          throw new Error('activity not found');
        }),
      });

      await permission.request();

      expect(await AsyncStorage.getItem(STORAGE_KEYS.exactAlarmPermissionRequested)).toBeNull();
      await expect(permission.canSchedule()).resolves.toBe(false);
    });

    it('no hace nada fuera de Android', async () => {
      const openSettingsScreen = jest.fn(async () => undefined);
      const permission = new ExactAlarmPermission({
        platform: { os: 'ios', version: '17.4' },
        packageName: null,
        openSettingsScreen,
      });

      await permission.request();

      expect(openSettingsScreen).not.toHaveBeenCalled();
      expect(await AsyncStorage.getItem(STORAGE_KEYS.exactAlarmPermissionRequested)).toBeNull();
    });
  });
});
