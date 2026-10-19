import { SessionRepository } from '../session-repository';
import { SettingsRepository } from '../settings-repository';
import { STORAGE_KEYS } from '../../constants/storage-keys';
import type { KeyValueStore } from '../key-value-store';
import { SESSION_SCHEMA_VERSION, SessionStatus, TimerPhase } from '../../../features/timer/types';
import type { PersistentSession } from '../../../features/timer/types';
import { DEFAULT_USER_SETTINGS } from '../../../features/settings/types';

class InMemoryStore implements KeyValueStore {
  readonly data = new Map<string, string>();

  async getItem(key: string): Promise<string | null> {
    return this.data.get(key) ?? null;
  }

  async setItem(key: string, value: string): Promise<void> {
    this.data.set(key, value);
  }

  async removeItem(key: string): Promise<void> {
    this.data.delete(key);
  }
}

const session: PersistentSession = {
  sessionStartTimestamp: 1000,
  sessionEndTimestamp: 2000,
  lastSavedTimestamp: 1500,
  currentPhase: TimerPhase.Study,
  status: SessionStatus.Paused,
  remainingTime: 25,
  completedPomodoros: 1,
  schemaVersion: SESSION_SCHEMA_VERSION,
};

describe('SessionRepository', () => {
  it('devuelve null si no hay sesión guardada', async () => {
    const repo = new SessionRepository(new InMemoryStore());
    expect(await repo.load()).toBeNull();
  });

  it('guarda y recupera la sesión bajo la clave oficial', async () => {
    const store = new InMemoryStore();
    const repo = new SessionRepository(store);
    await repo.save(session);
    expect(store.data.has(STORAGE_KEYS.activeSession)).toBe(true);
    expect(await repo.load()).toEqual(session);
  });

  it('clear elimina la sesión', async () => {
    const store = new InMemoryStore();
    const repo = new SessionRepository(store);
    await repo.save(session);
    await repo.clear();
    expect(await repo.load()).toBeNull();
  });

  it('trata datos corruptos como ausencia de sesión', async () => {
    const store = new InMemoryStore();
    store.data.set(STORAGE_KEYS.activeSession, 'corrupto');
    const repo = new SessionRepository(store);
    expect(await repo.load()).toBeNull();
  });
});

describe('SettingsRepository', () => {
  it('devuelve los valores por defecto si no hay settings', async () => {
    const repo = new SettingsRepository(new InMemoryStore());
    expect(await repo.load()).toEqual(DEFAULT_USER_SETTINGS);
  });

  it('guarda y recupera settings bajo la clave oficial', async () => {
    const store = new InMemoryStore();
    const repo = new SettingsRepository(store);
    const settings = { ...DEFAULT_USER_SETTINGS, longBreakDuration: 20 };
    await repo.save(settings);
    expect(store.data.has(STORAGE_KEYS.userSettings)).toBe(true);
    expect(await repo.load()).toEqual(settings);
  });
});
