/**
 * Adaptador de AsyncStorage.
 *
 * Envuelve `@react-native-async-storage/async-storage` implementando el puerto
 * `KeyValueStore`. Es el único punto del proyecto que toca AsyncStorage.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { KeyValueStore } from './key-value-store';

export const asyncStorageAdapter: KeyValueStore = {
  getItem: (key) => AsyncStorage.getItem(key),
  setItem: (key, value) => AsyncStorage.setItem(key, value),
  removeItem: (key) => AsyncStorage.removeItem(key),
};
