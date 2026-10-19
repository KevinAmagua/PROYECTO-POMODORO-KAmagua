/**
 * Hook de presentación de la configuración (HU-005).
 *
 * Devuelve la configuración vigente y la acción de actualización validada.
 */

import { usePomodoroContext } from '@/providers/pomodoro-provider';
import type { UpdateResult } from '@/features/settings/application';
import type { UserSettings } from '@/features/settings/types';

export interface UseSettingsResult {
  settings: UserSettings;
  updateSettings(patch: Partial<UserSettings>): Promise<UpdateResult>;
}

export function useSettings(): UseSettingsResult {
  const { settings, updateSettings } = usePomodoroContext();
  return { settings, updateSettings };
}
