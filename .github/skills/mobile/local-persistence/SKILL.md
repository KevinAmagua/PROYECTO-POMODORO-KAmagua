---
name: local-persistence
description: "Persistencia local con AsyncStorage: repositorios, claves y (de)serialización. WHEN: guardar/cargar settings o sesión, definir StorageRepository, migrar o versionar datos locales."
---

# Skill: Local Persistence

## Purpose

Definir cómo se persiste el estado local. Única tecnología permitida: **AsyncStorage** (`@react-native-async-storage/async-storage`). Sin backend ni red.

## Cuándo usarla

- Implementar `StorageRepository`, `SettingsRepository`, `SessionRepository`.
- Definir claves, serialización o versionado de datos.

## Claves oficiales

| Clave | Contenido |
| --- | --- |
| `user_settings` | `UserSettings` |
| `active_session` | `PersistentSession` |

## Entidades

**UserSettings**: `studyDuration` (25), `shortBreakDuration` (5), `longBreakDuration` (15), `pomodorosPerCycle` (4).

**PersistentSession**: `sessionStartTimestamp`, `sessionEndTimestamp`, `lastSavedTimestamp`, `currentPhase`, `status`, `remainingTime`, `completedPomodoros`, `schemaVersion`.

## Diseño

- `async-storage-adapter.ts`: envuelve AsyncStorage (get/set/remove) y centraliza manejo de errores.
- Repositorios por entidad con métodos tipados (`getSettings`, `saveSettings`, `getSession`, `saveSession`, `clearSession`).
- Serialización JSON; **`schemaVersion`** para migraciones futuras.
- La capa de dominio/aplicación no importa AsyncStorage directamente: usa el repositorio.

## Reglas

- Escribir en cada cambio de estado relevante (start/pause/resume/reset/fin de fase).
- Valores corruptos o ausentes → `null`/default seguro, nunca crash.
- Sin secretos: aquí no hay datos sensibles.
- Sin red ni sincronización remota.
- No usar `any` en la (de)serialización.

## Checklist

- [ ] Claves exactas `user_settings` y `active_session`.
- [ ] Repositorios tipados por entidad.
- [ ] Manejo de datos ausentes/corruptos.
- [ ] `schemaVersion` presente en la sesión.
- [ ] UI/dominio no importan AsyncStorage directamente.
- [ ] Tests de (de)serialización.
