# Timer Engine Specification

## Objetivo

Gestionar toda la lógica del contador Pomodoro.

## Reglas

### Inicio

Al presionar iniciar:

- El estado cambia a RUNNING.
- Se calcula timestamp final.

### Pausa

Al pausar:

- Se almacena tiempo restante.
- El estado cambia a PAUSED.

### Continuar

Al reanudar:

- Se recalcula timestamp final.
- Continúa la cuenta.

### Reiniciar

Al reiniciar:

- Solicitar confirmación.
- Volver al tiempo original.

## Restricción crítica

No depender únicamente de setInterval.

El tiempo debe calcularse mediante timestamps.

Tiempo restante:

remaining =
endTimestamp - currentTimestamp

Esto garantiza precisión incluso con aplicación cerrada.