/**
 * SettingsManager — orquestación de la configuración del usuario (HU-005).
 *
 * Responsabilidades:
 *  - mantener los parámetros en memoria,
 *  - cargarlos/guardarlos vía `SettingsStore` (AsyncStorage en infraestructura),
 *  - validar antes de persistir (nunca guarda valores inválidos),
 *  - notificar a los suscriptores ante cambios.
 *
 * Efecto sobre una sesión en curso: el motor (`PomodoroEngine.setConfig`) aplica
 * las nuevas duraciones a la **siguiente** fase; la fase en marcha o pausada
 * conserva su tiempo. La composición (mapear settings → `TimerConfig` con
 * `timerConfigFromSettings` y llamar a `timer.setConfig`) se hace en el wiring de
 * la app para que este manager no dependa del feature de temporizador.
 */

import { DEFAULT_USER_SETTINGS } from '../types';
import type { UserSettings } from '../types';
import { validateSettings } from '../domain';
import type { SettingsValidationErrors } from '../domain';
import type { SettingsStore } from './settings-store';

export interface SettingsManagerOptions {
  store: SettingsStore;
}

export interface UpdateResult {
  /** `true` si los valores eran válidos y se persistieron. */
  ok: boolean;
  /** Errores de validación por campo (vacío si `ok`). */
  errors: SettingsValidationErrors;
}

export type SettingsListener = (settings: UserSettings) => void;

export class SettingsManager {
  private readonly store: SettingsStore;
  private readonly listeners = new Set<SettingsListener>();
  private settings: UserSettings = { ...DEFAULT_USER_SETTINGS };

  constructor(options: SettingsManagerOptions) {
    this.store = options.store;
  }

  /** Configuración actual (en memoria). */
  getSettings(): UserSettings {
    return this.settings;
  }

  /** Carga la configuración persistida (o defaults) y notifica. */
  async load(): Promise<UserSettings> {
    this.settings = await this.store.load();
    this.notify();
    return this.settings;
  }

  /**
   * Aplica un cambio parcial. Si algún valor resultante es inválido, no persiste
   * ni notifica y devuelve los errores para que la UI los muestre.
   */
  async update(patch: Partial<UserSettings>): Promise<UpdateResult> {
    const candidate: UserSettings = { ...this.settings, ...patch };
    const { isValid, errors } = validateSettings(candidate);
    if (!isValid) {
      return { ok: false, errors };
    }
    await this.store.save(candidate);
    this.settings = candidate;
    this.notify();
    return { ok: true, errors: {} };
  }

  /** Registra un oyente; devuelve la función para cancelarlo. */
  subscribe(listener: SettingsListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener(this.settings);
    }
  }
}
