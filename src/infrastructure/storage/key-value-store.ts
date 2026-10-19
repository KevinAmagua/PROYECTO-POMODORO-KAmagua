/**
 * Puerto de almacenamiento clave-valor.
 *
 * Abstrae AsyncStorage para poder inyectar una implementación falsa en tests y
 * para que los repositorios no dependan del módulo nativo directamente.
 */
export interface KeyValueStore {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}
