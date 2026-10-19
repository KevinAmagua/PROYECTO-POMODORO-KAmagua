import { SettingsManager } from '../settings-manager';
import type { SettingsStore } from '../settings-store';
import { DEFAULT_USER_SETTINGS } from '../../types';
import type { UserSettings } from '../../types';

class InMemorySettingsStore implements SettingsStore {
  settings: UserSettings = { ...DEFAULT_USER_SETTINGS };
  saves = 0;
  failOnSave = false;

  async load(): Promise<UserSettings> {
    return this.settings;
  }

  async save(settings: UserSettings): Promise<void> {
    if (this.failOnSave) {
      throw new Error('storage down');
    }
    this.settings = settings;
    this.saves += 1;
  }
}

describe('SettingsManager', () => {
  it('empieza con los valores por defecto', () => {
    const manager = new SettingsManager({ store: new InMemorySettingsStore() });
    expect(manager.getSettings()).toEqual(DEFAULT_USER_SETTINGS);
  });

  it('load aplica lo persistido y notifica', async () => {
    const store = new InMemorySettingsStore();
    store.settings = { ...DEFAULT_USER_SETTINGS, studyDuration: 40 };
    const manager = new SettingsManager({ store });
    const seen: UserSettings[] = [];
    manager.subscribe((s) => seen.push(s));

    const loaded = await manager.load();

    expect(loaded.studyDuration).toBe(40);
    expect(seen.at(-1)?.studyDuration).toBe(40);
  });

  it('update válido persiste y notifica', async () => {
    const store = new InMemorySettingsStore();
    const manager = new SettingsManager({ store });
    const seen: UserSettings[] = [];
    manager.subscribe((s) => seen.push(s));

    const result = await manager.update({ studyDuration: 30 });

    expect(result).toEqual({ ok: true, errors: {} });
    expect(manager.getSettings().studyDuration).toBe(30);
    expect(store.settings.studyDuration).toBe(30);
    expect(store.saves).toBe(1);
    expect(seen).toHaveLength(1);
  });

  it('update inválido no persiste ni notifica y devuelve errores', async () => {
    const store = new InMemorySettingsStore();
    const manager = new SettingsManager({ store });
    const seen: UserSettings[] = [];
    manager.subscribe((s) => seen.push(s));

    const result = await manager.update({ studyDuration: 0 });

    expect(result.ok).toBe(false);
    expect(result.errors).toEqual({ studyDuration: 'Debe estar entre 1 y 180.' });
    expect(manager.getSettings().studyDuration).toBe(DEFAULT_USER_SETTINGS.studyDuration);
    expect(store.saves).toBe(0);
    expect(seen).toHaveLength(0);
  });

  it('aplica el cambio parcial sobre los valores actuales', async () => {
    const store = new InMemorySettingsStore();
    const manager = new SettingsManager({ store });

    await manager.update({ pomodorosPerCycle: 6 });
    await manager.update({ studyDuration: 50 });

    expect(manager.getSettings()).toEqual({
      ...DEFAULT_USER_SETTINGS,
      pomodorosPerCycle: 6,
      studyDuration: 50,
    });
  });

  it('persiste la restauración de todos los valores por defecto', async () => {
    const store = new InMemorySettingsStore();
    const manager = new SettingsManager({ store });

    await manager.update({
      studyDuration: 50,
      shortBreakDuration: 10,
      longBreakDuration: 20,
      pomodorosPerCycle: 6,
    });
    const result = await manager.update(DEFAULT_USER_SETTINGS);

    expect(result).toEqual({ ok: true, errors: {} });
    expect(manager.getSettings()).toEqual(DEFAULT_USER_SETTINGS);
    expect(store.settings).toEqual(DEFAULT_USER_SETTINGS);
    expect(store.saves).toBe(2);
  });

  it('propaga los errores de persistencia y conserva el estado anterior', async () => {
    const store = new InMemorySettingsStore();
    store.failOnSave = true;
    const manager = new SettingsManager({ store });
    const seen: UserSettings[] = [];
    manager.subscribe((settings) => seen.push(settings));

    await expect(manager.update({ studyDuration: 30 })).rejects.toThrow('storage down');
    expect(manager.getSettings()).toEqual(DEFAULT_USER_SETTINGS);
    expect(seen).toHaveLength(0);
  });
});
