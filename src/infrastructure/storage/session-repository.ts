/**
 * Repositorio de la sesión activa (`active_session`).
 *
 * Traduce entre `PersistentSession` y AsyncStorage. Los datos corruptos o de
 * una versión de esquema desconocida se tratan como "sin sesión" (`null`).
 */

import { STORAGE_KEYS } from '../constants/storage-keys';
import { asyncStorageAdapter } from './async-storage-adapter';
import { parseSession, serializeSession } from './serialization';
import type { KeyValueStore } from './key-value-store';
import type { PersistentSession } from '../../features/timer/types';

export class SessionRepository {
  constructor(private readonly store: KeyValueStore = asyncStorageAdapter) {}

  async load(): Promise<PersistentSession | null> {
    const raw = await this.store.getItem(STORAGE_KEYS.activeSession);
    return parseSession(raw);
  }

  async save(session: PersistentSession): Promise<void> {
    await this.store.setItem(STORAGE_KEYS.activeSession, serializeSession(session));
  }

  async clear(): Promise<void> {
    await this.store.removeItem(STORAGE_KEYS.activeSession);
  }
}
