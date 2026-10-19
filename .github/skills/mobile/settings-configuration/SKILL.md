---
name: settings-configuration
description: "HU-005: parámetros configurables del Pomodoro y sus validaciones. WHEN: implementar la pantalla Settings, SettingsManager, límites de duración o persistir/restaurar configuración."
---

# Skill: Settings Configuration (HU-005)

## Purpose

Definir los parámetros configurables, sus validaciones y su persistencia.

## Cuándo usarla

- Implementar `SettingsManager` y la pantalla Settings.
- Añadir validaciones o valores por defecto.

## Parámetros

| Parámetro | Campo | Default | Unidad |
| --- | --- | --- | --- |
| Tiempo de estudio | `studyDuration` | 25 | min |
| Descanso corto | `shortBreakDuration` | 5 | min |
| Descanso largo | `longBreakDuration` | 15 | min |
| Pomodoros por ciclo | `pomodorosPerCycle` | 4 | — |

## Validaciones (obligatorias)

- No vacío.
- No negativo.
- **No cero**.
- Enteros (sin decimales) y dentro de un rango razonable.

## Persistencia

- Guardar en AsyncStorage (`user_settings`) vía `SettingsRepository` (ver skill `local-persistence`).
- Cargar al iniciar; aplicar defaults si no existen.
- El motor (`PomodoroEngine`) consume las duraciones (min → seg) y `pomodorosPerCycle`.

## Comportamiento

- Si cambian los ajustes a media sesión: aplicar en la **siguiente** fase, o pedir confirmación para reiniciar la actual (definir y documentar).
- Mostrar feedback claro de error de validación; no permitir guardar inválido.

## Reglas

- La validación vive en `SettingsManager` (no en la UI).
- Sin `any`; números tipados.
- Sin red.

## Checklist

- [ ] Los 4 parámetros editables y persistidos.
- [ ] Rechaza vacío, negativo y cero.
- [ ] Defaults correctos (25/5/15/4).
- [ ] Efecto sobre el motor definido (siguiente fase o confirmación).
- [ ] Tests de validación (incluye bordes).
