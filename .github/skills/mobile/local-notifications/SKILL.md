---
name: local-notifications
description: "HU-004: notificaciones y alarmas de sistema con sonido/vibración al terminar una fase, incluso con pantalla bloqueada o app cerrada. WHEN: implementar NotificationService/AlarmService, canales, permisos Android, alarmas exactas o programar/cancelar avisos."
---

# Skill: Local Notifications & Alarms (HU-004)

## Purpose

Avisar al usuario al terminar cada fase con sonido y vibración, con la app abierta, minimizada o cerrada. Prioridad **Alta**, riesgo **Alto**.

## Cuándo usarla

- Implementar `NotificationService` y `AlarmService`.
- Configurar canales, permisos o alarmas exactas de Android.
- Programar/cancelar/reprogramar avisos de fin de fase.

## Librería

`expo-notifications` (notificaciones locales + alarmas exactas) y `expo-task-manager` (handler en background/terminated). **No** usar tareas periódicas para disparar a hora exacta.

## Configuración (app.json / config plugin)

- Plugin `expo-notifications` con `icon` (96x96 blanco + transparente), `color` institucional y `sounds` si aplica.
- Permisos Android: `POST_NOTIFICATIONS` (13+), `SCHEDULE_EXACT_ALARM` (12+). Evaluar `USE_EXACT_ALARM` solo si Google Play lo autoriza para apps de temporizador.
- `RECEIVE_BOOT_COMPLETED` lo añade el módulo (repone alarmas tras reinicio).

## Canales (obligatorio en Android 8+)

Crear el canal **antes** de pedir permisos (en Android 13+ el prompt no aparece sin canal):

- `importance: MAX`, `vibrationPattern`, sonido y nombre institucional.

## Permisos

- `requestPermissionsAsync()` para notificaciones (`POST_NOTIFICATIONS`).
- **Alarma exacta (`SCHEDULE_EXACT_ALARM`, Android 12+):** `expo-notifications@57.0.23`
  **no** expone API de permiso (`getExactAlarmPermissionsAsync` no existe en SDK 57;
  llegó en SDK 58). Gestionar **100% en JS** con `expo-intent-launcher`:
  `IntentLauncher.startActivityAsync(ActivityAction.REQUEST_SCHEDULE_EXACT_ALARM)`
  con `data: package:<app>` (sin `data` en Expo Go). Como JS no puede leer
  `AlarmManager.canScheduleExactAlarms()`, aplicar la heurística de HU-004
  (Android < 14: concedido por defecto; Android 14+: asumido tras completar el
  flujo de ajustes — ver `ExactAlarmPermission`). Si el permiso está denegado,
  `expo-notifications` cae en silencio a `setAndAllowWhileIdle` (inexacta):
  degradar a `bestEffort` informando al usuario.

## Foreground vs background

- `setNotificationHandler` decide mostrar banner/sonido con la app en primer plano.
- `registerTaskAsync` + `TaskManager.defineTask` para reaccionar en background/terminated (p. ej. navegar vía `data.url`).

## Programación de alarmas

- Al iniciar/reanudar: agendar para `sessionEndTimestamp` con trigger **exacto** (`alarmClock`/fecha), `sound` y `vibrationPattern`, visible en pantalla bloqueada.
- Al pausar/reiniciar: **cancelar** la alarma.
- Al cambiar de fase: agendar la nueva.
- Guardar el `identifier` devuelto para poder cancelar.

## Reglas

- Sin red: solo notificaciones locales (no push remoto).
- Nunca depender de tareas en background para exactitud.
- Reagendar tras reinicio del dispositivo (lo cubre boot).
- Verificar en Android 13/14 (permisos y canales cambian).

## Checklist

- [ ] Canal creado antes de pedir permisos.
- [ ] Permisos de notificación y de alarma exacta gestionados.
- [ ] Aviso con sonido/vibración en pantalla bloqueada y app cerrada.
- [ ] Cancelación al pausar/reiniciar; reprogramación al reanudar/fase.
- [ ] Handler foreground configurado.
- [ ] Solo local, sin red.
