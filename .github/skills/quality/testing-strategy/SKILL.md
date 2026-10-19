---
name: testing-strategy
description: "Estrategia de pruebas: unitarias, funcionales, integración y matriz manual. WHEN: escribir tests, preparar la verificación de una HU, definir evidencia de QA o elegir herramientas de test."
---

# Skill: Testing Strategy

## Purpose

Definir qué probar, con qué herramienta y con qué evidencia, para validar cada HU del proyecto.

## Cuándo usarla

- Al implementar (`mobile`/`frontend`) y al verificar (`qa`).

## Pirámide de pruebas

1. **Unitarias** (Jest + Jest preset de Expo): dominio y managers puros.
2. **Funcionales**: acciones y transiciones de fase.
3. **Integración**: storage + notificaciones con mocks.
4. **Manuales**: escenarios que requieren dispositivo físico.

## Cobertura mínima por área

- `CountdownCalculator`: cálculo y bordes (0, exacto, negativo).
- `PomodoroEngine` / `PhaseController`: todos los estados y transiciones; pomodoro N → `LONG_BREAK`.
- `SettingsManager`: validaciones (vacío/negativo/cero) y defaults.
- Repositorios: (de)serialización y datos ausentes/corruptos.
- `SessionManager`: rehidratar RUNNING/PAUSED; `now >= endTimestamp` ⇒ `FINISHED`.
- Alarmas: agendar/cancelar/reprogramar (mock de expo-notifications).

## Técnicas

- **Timestamps simulados**: no esperes minutos reales; inyecta `now`.
- Mocks de `@react-native-async-storage/async-storage` y `expo-notifications`.
- Comandos: `npx expo lint`, `npx tsc --noEmit`, `npx jest`.

## Matriz manual (dispositivo Android físico)

| Escenario | Esperado |
| --- | --- |
| Bloquear/desbloquear con timer corriendo | Tiempo restante correcto |
| Minimizar y volver | Tiempo correcto |
| Cerrar desde recientes y reabrir | Sesión recuperada |
| Termina con app cerrada | Aviso recibido; al abrir, `FINISHED` |
| Pausar y cerrar | Sigue pausado, sin aviso |
| Modo avión completo | Todo funciona (HU-006) |
| Android 13/14 permisos | Prompt y canales correctos |
| Reinicio del teléfono | Alarma repuesta |

## Reglas

- No modificar producción para "pasar" un test; reportar defecto.
- Todo criterio de aceptación debe tener test o evidencia manual.
- Evidencia con paso/resultado esperado/obtenido.

## Checklist

- [ ] Unitarias del dominio en verde.
- [ ] Integración con storage/notificaciones mockeado.
- [ ] Matriz manual ejecutada con evidencia.
- [ ] `expo lint` y `tsc --noEmit` limpios.
- [ ] Sin dependencias de red validadas explícitamente.
