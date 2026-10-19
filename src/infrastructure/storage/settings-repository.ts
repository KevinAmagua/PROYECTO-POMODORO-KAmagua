/**
 * Repositorio de la configuración del usuario (`user_settings`).
 *
 * `load` nunca falla: aplica valores por defecto ante datos ausentes o
 * corruptos (HU-005).
 */

import { STORAGE_KEYS } from '../constants/storage-keys';
import { asyncStorageAdapter } from './async-storage-adapter';
import { parseUserSettings, serializeUserSettings } from './serialization';
import type { KeyValueStore } from './key-value-store';
import type { UserSettings } from '../../features/settings/types';

export class SettingsRepository {
  constructor(private readonly store: KeyValueStore = asyncStorageAdapter) {}

  async load(): Promise<UserSettings> {
    const raw = await this.store.getItem(STORAGE_KEYS.userSettings);
    return parseUserSettings(raw);
  }

  async save(settings: UserSettings): Promise<void> {
    await this.store.setItem(STORAGE_KEYS.userSettings, serializeUserSettings(settings));
  }
}
