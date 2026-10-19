# HU-003

## Nombre

Funcionamiento con aplicación cerrada

## Prioridad

Alta

## Riesgo

Alto

## Objetivo

Mantener el temporizador activo aunque:

- Pantalla bloqueada.
- App minimizada.
- App cerrada.

## Solución técnica

Persistir:

- timestamp inicio
- timestamp final
- estado actual

Al abrir:

remaining = endTimestamp - Date.now()

## Casos de aceptación

Escenario: Bloquear el celular
Dado que tengo el temporizador corriendo
Cuando bloqueo el celular y lo desbloqueo unos minutos después
Entonces la aplicación muestra el tiempo restante correcto, descontando lo que pasó mientras estaba bloqueado
Escenario: Cerrar la aplicación
Dado que tengo el temporizador corriendo
Cuando cierro la aplicación desde las apps recientes y la vuelvo a abrir
Entonces la aplicación recupera la sesión y muestra el tiempo restante correcto
Escenario: El tiempo termina con la aplicación cerrada
Dado que cerré la aplicación con el temporizador corriendo
Cuando el tiempo se cumple antes de que vuelva a abrirla
Entonces igual recibo el aviso de fin y, al abrir la aplicación, la fase aparece como terminada
Escenario: Pausar antes de cerrar
Dado que pausé el temporizador
Cuando cierro la aplicación y la vuelvo a abrir
Entonces el temporizador sigue pausado con el mismo tiempo restante y no recibo ningún aviso
