/**
 * ExactAlarmPermission — gestión del permiso `SCHEDULE_EXACT_ALARM` 100% JS (HU-004).
 *
 * Contexto (verificado en este proyecto):
 *  - `expo-notifications@57.0.23` no expone API de permiso de alarma exacta
 *    (`getExactAlarmPermissionsAsync` llega en SDK 58) y la app no usa código
 *    nativo propio.
 *  - Por tanto `canSchedule` NO puede leer `AlarmManager.canScheduleExactAlarms()`
 *    y aplica la heurística documentada en `.github/specs/hu-004-notifications.md`:
 *    Android < 14 concede el permiso por defecto; Android 14+ lo deniega en
 *    instalaciones nuevas y se asume concedido una vez el usuario ha completado
 *    el flujo de la pantalla de ajustes (indicador persistido en AsyncStorage).
 *  - `request` abre la pantalla de sistema `REQUEST_SCHEDULE_EXACT_ALARM` con
 *    `expo-intent-launcher` y, al volver, persiste ese indicador.
 *
 * Limitación conocida: si el usuario deniega o revoca el permiso después de
 * volver de los ajustes, la app no puede detectarlo desde JS y las alarmas
 * degradan a inexactas (misma degradación ya descrita en HU-004).
 */

import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as IntentLauncher from 'expo-intent-launcher';
import { Platform } from 'react-native';

import { STORAGE_KEYS } from '../constants/storage-keys';
import { asyncStorageAdapter } from '../storage/async-storage-adapter';
import type { KeyValueStore } from '../storage/key-value-store';

/**
 * API level a partir del cual Android deja de conceder `SCHEDULE_EXACT_ALARM`
 * por defecto (Android 14, ver HU-004).
 */
const DEFAULT_DENIED_FROM_API = 34;

export interface ExactAlarmPermissionPlatform {
  os: string;
  version: number | string;
}

export interface ExactAlarmPermissionDeps {
  /** Almacén del indicador de flujo; por defecto AsyncStorage. */
  store?: KeyValueStore;
  /** Plataforma observada; por defecto `Platform` de React Native. */
  platform?: ExactAlarmPermissionPlatform;
  /** Abre la pantalla de sistema de alarmas exactas; por defecto `expo-intent-launcher`. */
  openSettingsScreen?: (packageName: string | null) => Promise<void>;
  /** Paquete de la app para el enlace de ajustes; en Expo Go es `null`. */
  packageName?: string | null;
}

/** Contrato de gestión del permiso de alarma exactas (permite dobles en tests). */
export interface ExactAlarmPermissionService {
  /** ¿Puede la app programar alarmas exactas? */
  canSchedule(): Promise<boolean>;
  /** Abre la pantalla de sistema de alarmas exactas y registra el flujo. */
  request(): Promise<void>;
}

async function openExactAlarmSettings(packageName: string | null): Promise<void> {
  await IntentLauncher.startActivityAsync(
    IntentLauncher.ActivityAction.REQUEST_SCHEDULE_EXACT_ALARM,
    packageName === null ? undefined : { data: `package:${packageName}` },
  );
}

function resolvePackageName(): string | null {
  const isExpoGo =
    Constants.executionEnvironment === ExecutionEnvironment.StoreClient &&
    Constants.expoGoConfig !== null;
  if (isExpoGo) {
    // En Expo Go el proceso que agenda las alarmas es el host: sin `data`,
    // Android abre la lista de acceso especial y el usuario elige la app.
    return null;
  }
  return Constants.expoConfig?.android?.package ?? null;
}

export class ExactAlarmPermission implements ExactAlarmPermissionService {
  private readonly store: KeyValueStore;
  private readonly platform: ExactAlarmPermissionPlatform;
  private readonly openSettingsScreen: (packageName: string | null) => Promise<void>;
  private readonly packageName: string | null;

  constructor(deps: ExactAlarmPermissionDeps = {}) {
    this.store = deps.store ?? asyncStorageAdapter;
    this.platform = deps.platform ?? { os: Platform.OS, version: Platform.Version };
    this.openSettingsScreen = deps.openSettingsScreen ?? openExactAlarmSettings;
    this.packageName = deps.packageName !== undefined ? deps.packageName : resolvePackageName();
  }

  /**
   * ¿Puede la app programar alarmas exactas? Ver la limitación documentada en
   * la cabecera del módulo: es una heurística, no una lectura nativa.
   */
  async canSchedule(): Promise<boolean> {
    if (this.platform.os !== 'android') {
      return true;
    }
    const version =
      typeof this.platform.version === 'number'
        ? this.platform.version
        : Number(this.platform.version);
    if (!Number.isNaN(version) && version < DEFAULT_DENIED_FROM_API) {
      return true;
    }
    return (await this.store.getItem(STORAGE_KEYS.exactAlarmPermissionRequested)) === 'true';
  }

  /**
   * Abre la pantalla de sistema de alarmas exactas y, cuando el usuario vuelve,
   * registra que el flujo se completó (pasa a considerarse concedido).
   */
  async request(): Promise<void> {
    if (this.platform.os !== 'android') {
      return;
    }
    try {
      await this.openSettingsScreen(this.packageName);
    } catch {
      // Best-effort: si la pantalla no abre, no se registra el flujo.
      return;
    }
    await this.store.setItem(STORAGE_KEYS.exactAlarmPermissionRequested, 'true');
  }
}
