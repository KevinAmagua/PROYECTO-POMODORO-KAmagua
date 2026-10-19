# Notification / Alarm Specification

> ⚠️ **Corrección Fase 1.** Este archivo era un **duplicado literal** de
> `timer-engine-spec.md`. El contenido operativo de notificaciones proviene de
> `hu-004-notifications.md`. Se reemplaza el duplicado por este resumen para
> eliminar la contradicción.

## Objetivo

Alertar al usuario al finalizar una fase (estudio o descanso) con sonido y
vibración, incluso con la pantalla bloqueada o la aplicación cerrada.

## Requisitos

- Sonido.
- Vibración.
- Funcionar con pantalla bloqueada.
- Funcionar con la aplicación cerrada.

## Estrategia

- Notificaciones locales y alarmas de sistema con `expo-notifications`.
- Programar una alarma exacta para `sessionEndTimestamp` al iniciar/reanudar.
- Cancelar la alarma al pausar/reiniciar; reprogramar al reanudar o cambiar fase.
- No usar tareas periódicas en background para disparar a hora exacta.

## Fuente de verdad

`hu-004-notifications.md` y el skill `mobile/local-notifications`.
