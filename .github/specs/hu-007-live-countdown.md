# HU-007

## Nombre

Contador en vivo en pantalla bloqueada y bandeja de notificaciones

## Prioridad

Media-Alta

## Riesgo

Alto (servicio en primer plano + tipo de FGS en Android 14+)

## Objetivo

Mostrar el tiempo restante de la fase en curso como una **notificación
persistente y actualizada en vivo**, visible en la pantalla de bloqueo y en la
bandeja (pull-down), que siga funcionando con la app minimizada o cerrada.

## Motivación

La regla del proyecto es `remaining = endTimestamp - Date.now()` y el temporizador
debe seguir siendo correcto con la app cerrada (HU-003). Hoy no hay forma de ver
el tiempo restante sin abrir la app. Se quiere una notificación de progreso
permanente.

## Restricción técnica (verificada)

`expo-notifications@57.0.23` **no** ofrece API para presentar/actualizar una
notificación ya mostrada (no existe `presentNotificationAsync`); solo expone el
flag `sticky` (`NotificationContentInput.sticky` → `setOngoing`). Por tanto, un
contador que avance cada segundo en la notificación **no** puede hacerse solo con
`expo-notifications`: requiere un **servicio en primer plano** nativo.

## Decisión

Implementar un **módulo Expo local** (Kotlin) con:

- `ForegroundService` que publica una notificación **ongoing** (`setOngoing(true)`).
- Contador **nativo** con `setUsesChronometer(true)` +
  `setChronometerCountDown(true)` + `setWhen(endTimestamp)`: Android actualiza
  los segundos sin que JS intervenga y sin refrescos por segundo.
- Compatibilidad Android 14+: declarar tipo de servicio
  `FOREGROUND_SERVICE_SPECIAL_USE` (subtipo de uso especial justificado: temporizador)
  y `FOREGROUND_SERVICE`.
- Config plugin del módulo para inyectar permisos/servicio en el manifiesto
  (sin editar `android/` a mano; CNG).

## Requisitos funcionales

- Al **iniciar/reanudar** una fase: arranca el servicio y muestra la notificación
  persistente con el tiempo restante y la fase actual.
- Al **pausar**: se detiene el servicio y se descarta/actualiza la notificación
  (si se mantiene, debe quedar congelada y sin cronómetro activo).
- Al **reiniciar**: se detiene el servicio.
- Al **terminar la fase**: el servicio se detiene y se emite el aviso de fin de
  fase (HU-004); el contador cambia a la siguiente fase.
- La notificación es visible en **pantalla bloqueada** (`lockscreenVisibility: PUBLIC`)
  y en la bandeja; no descartable por swipe mientras corre (`ongoing`).
- No depende de JS para avanzar los segundos (funciona con la app cerrada).
- El texto respeta el design system (Cotopaxi Blue `#1E1F6E` como acento).

## Criterios de aceptación

- **AC-1** Iniciar una fase y bloquear el teléfono: en la pantalla de bloqueo se
  ve el tiempo restante **descontando en vivo**.
- **AC-2** El contador sigue bajando con la app cerrada desde recientes.
- **AC-3** Pausar desde la app detiene el contador de la notificación.
- **AC-4** Reanudar lo reanuda con el tiempo correcto (recalculado desde
  `endTimestamp`).
- **AC-5** Al terminar la fase, se emite el aviso de HU-004 y la notificación de
  progreso desaparece (o pasa a la nueva fase).
- **AC-6** La notificación no es descartable por swipe mientras la fase corre.
- **AC-7** Funciona en Android 13, 14 y 15 sin excepción de FGS.

## Riesgos

- Tipo de FGS `specialUse`: Play Console exige justificación. Para APK interno /
  EAS `preview` no aplica. Documentar en el release.
- Comportamiento por OEM: acotar con batería; documentar limitación.
- Coherencia con HU-003: la fuente de verdad sigue siendo el timestamp; el
  servicio solo **visualiza**.

## Fuera de alcance

- Controles (pausar/reanudar) dentro de la notificación (se puede evaluar luego).
- Sonido continuo o alarma tipo reloj.

## Dependencias

Expo Modules API (módulo local), `expo-build-properties` si hace falta config nativa,
HU-003 (timestamp de fin), HU-004 (aviso de fin de fase).

## Trazabilidad

- Plan: `docs/plans/plan-notificaciones-cuenta-atras.md`.
