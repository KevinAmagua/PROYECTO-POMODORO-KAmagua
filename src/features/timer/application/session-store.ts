/**
 * Puerto de persistencia de sesión (implementado por `SessionRepository` en la
 * capa de infraestructura). Permite que la aplicación no dependa de AsyncStorage
 * ni de ningún detalle de almacenamiento.
 */

import type { PersistentSession } from '../types';

export interface SessionStore {
  load(): Promise<PersistentSession | null>;
  save(session: PersistentSession): Promise<void>;
  clear(): Promise<void>;
}
