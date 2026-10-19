---
name: pomodoro-timer-engine
description: "Máquina de estados, fases y cálculo de tiempo por timestamps del motor Pomodoro. WHEN: implementar o modificar el temporizador, fases STUDY/SHORT_BREAK/LONG_BREAK, conteo de pomodoros, iniciar/pausar/reanudar/reiniciar."
---

# Skill: Pomodoro Timer Engine

## Purpose

Definir las reglas del dominio del temporizador. El motor es **puro y testeable**: no importa React, Expo ni React Native.

## Cuándo usarla

- Implementar/ajustar `PomodoroEngine`, `PhaseController`, `CountdownCalculator`, `TimerManager`.
- Cambiar las reglas de transición de fase o el conteo de pomodoros.

## Modelo de estados

- `currentPhase`: `STUDY` · `SHORT_BREAK` · `LONG_BREAK`
- `status`: `IDLE` · `RUNNING` · `PAUSED` · `FINISHED`
- `completedPomodoros`: contador dentro del ciclo.

## Regla de oro del tiempo

```
remaining = endTimestamp - Date.now()
```

- `setInterval` **solo** refresca la UI (tick), **nunca** es la autoridad del tiempo.
- Al iniciar/reanudar: `endTimestamp = Date.now() + remaining`.
- Al pausar: `remaining = endTimestamp - Date.now()` y estado `PAUSED` (sin `endTimestamp` activo).

## Transiciones (HU-002)

```
STUDY  ──fin──▶ SHORT_BREAK
STUDY  ──fin (cada N pomodoros completados)──▶ LONG_BREAK
SHORT_BREAK/LONG_BREAK ──fin──▶ STUDY
```

- `N` = `pomodorosPerCycle` (settings). Contar `completedPomodoros` al terminar cada STUDY.
- Al alcanzar `N`, el siguiente descanso es `LONG_BREAK` y el ciclo reinicia el conteo.

## Acciones (HU-001)

| Acción | Efecto |
| --- | --- |
| Iniciar | `status=RUNNING`, calcula `endTimestamp` |
| Pausar | guarda `remaining`, `status=PAUSED` |
| Continuar | recalcula `endTimestamp`, `status=RUNNING` |
| Reiniciar | **pide confirmación**; vuelve al tiempo inicial de la fase actual |

- Reiniciar cancelado conserva el tiempo restante.

## Diseño de dominio

- `CountdownCalculator`: funciones puras de cálculo (`fromDuration`, `remainingFrom`, `format`).
- `PhaseController`: decide la siguiente fase y si incrementa pomodoros.
- `PomodoroEngine`: orquesta estado + transiciones; sin efectos secundarios de UI.

## Reglas

- Sin dependencias de React/Expo/RN en `domain/`.
- Sin `any` injustificado; enums/tipos explícitos.
- El tiempo de fases proviene de `SettingsManager` (minutos → segundos).

## Checklist

- [ ] `remaining` siempre derivado de timestamps.
- [ ] Pausa/reanudación conserva el tiempo exacto.
- [ ] Reiniciar pide confirmación y respeta la fase.
- [ ] Transición a `LONG_BREAK` en el pomodoro N.
- [ ] Dominio sin imports de UI/nativo.
- [ ] Tests unitarios de todos los estados y bordes.
