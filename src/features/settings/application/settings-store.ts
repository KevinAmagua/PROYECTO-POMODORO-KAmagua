/**
 * Puerto de persistencia de la configuración (implementado por
 * `SettingsRepository` en infraestructura). `load` debe devolver valores por
 * defecto si no hay datos.
 */

import type { UserSettings } from '../types';

export interface SettingsStore {
  load(): Promise<UserSettings>;
  save(settings: UserSettings): Promise<void>;
}
