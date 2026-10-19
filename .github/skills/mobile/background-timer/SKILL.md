---
name: background-timer
description: "HU-003: mantener la sesión correcta con pantalla bloqueada, app minimizada o cerrada. WHEN: implementar persistencia de sesión, rehidratación al abrir, transición con la app cerrada, o diagnosticar desfases de tiempo."
---

# Skill: Background Timer (HU-003)

## Purpose

Garantizar que el Pomodoro sigue siendo correcto cuando Android suspende o mata la app. Prioridad **Alta**, riesgo **Alto**.

## Cuándo usarla

- Persistir/rehidratar la sesión activa.
- Sincronizar la UI al volver a foreground.
- Diagnosticar tiempo incorrecto tras bloquear/cerrar.

## Problema técnico

Android congela o mata el proceso JS. Los `setInterval`/timers en memoria dejan de correr y las tareas periódicas (WorkManager, mínimo ~15 min) **no** sirven para disparar a hora exacta.

## Solución

1. **Timestamps persistentes** como única fuente de verdad. Persistir en cada evento:
   - `sessionStartTimestamp`
   - `sessionEndTimestamp`
   - `lastSavedTimestamp`
   - `currentPhase`, `status`
   - `remainingTime` (cuando `PAUSED`)
   - `completedPomodoros`
2. **Al abrir/volver a foreground** (`AppState === 'active'`):
   ```
   remaining = sessionEndTimestamp - Date.now()
   ```
   - Si `remaining <= 0` y había alarma → fase `FINISHED`.
   - Si `status === PAUSED` → permanece pausado, sin alarma ni aviso.
3. **Alarma de sistema** para `sessionEndTimestamp` (ver skill `local-notifications`) → cubre "terminó con la app cerrada".
4. Al reanudar: `sessionEndTimestamp = Date.now() + remainingTime` y **reagendar** alarma.

## Casos de aceptación

- Bloquear/desbloquear → tiempo restante correcto (descontando lo transcurrido).
- Cerrar desde recientes y reabrir → sesión recuperada con tiempo correcto.
- Termina con la app cerrada → aviso emitido y, al abrir, fase `FINISHED`.
- Pausar antes de cerrar → sigue pausado, mismo tiempo, sin aviso.

## Reglas

- `setInterval` es solo refresco visual.
- Nunca confíes en timers/efectos en memoria para la verdad del tiempo.
- Escribe en storage en cada cambio de estado relevante.
- No uses tareas periódicas para el conteo.

## Checklist

- [ ] Persistencia completa en cada transición.
- [ ] Rehidratación con `endTimestamp - Date.now()`.
- [ ] Foreground resincroniza la UI.
- [ ] Alarma agendada/reprogramada al iniciar/reanudar.
- [ ] Casos PAUSED y FINISHED diferenciados.
- [ ] Sin dependencia de timers en memoria.
