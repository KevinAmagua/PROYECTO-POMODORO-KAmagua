# Matriz de pruebas manuales — Academia Cotopaxi Pomodoro

> Ejecutar en **dispositivo Android físico**. Las filas funcionales
> (M-01 … M-09, M-11, M-13, M-15 … M-17) se pueden verificar en **Expo Go**
> (`npx expo start` + QR, sin APK). Las dependientes de alarma exacta o reinicio
> (M-10, M-12, M-14, M-18) requieren un **build nativo**
> (`npx expo run:android` o `eas build --profile preview`), porque Expo
> Go no aplica los permisos (`SCHEDULE_EXACT_ALARM` / `RECEIVE_BOOT_COMPLETED`).
>
> Estado inicial de todas las filas: **Pendiente**. Anotar en "Resultado obtenido"
> el valor real y marcar OK / FALLA.

| ID | HU | Escenario | Pasos | Resultado esperado | Resultado obtenido | Estado |
| --- | --- | --- | --- | --- | --- | --- |
| M-01 | HU-001 | Iniciar | Presionar **Iniciar** | Cuenta regresiva desde el tiempo de estudio configurado (p. ej. 25:00) | — | Pendiente |
| M-02 | HU-001 | Pausar y reanudar | Corriendo, presionar **Pausar** y luego **Reanudar** | La cuenta continúa desde el tiempo en que se pausó | — | Pendiente |
| M-03 | HU-001 | Reiniciar y confirmar | Corriendo/pausado, **Reiniciar** → confirmar | Vuelve al tiempo inicial de la fase actual | — | Pendiente |
| M-04 | HU-001 | Reiniciar y cancelar | **Reiniciar** → **Cancelar** | Conserva el tiempo que llevaba | — | Pendiente |
| M-05 | HU-002 | Transición a descanso corto | Dejar terminar un estudio | Aparece "Descanso corto" y el indicador suma un pomodoro | — | Pendiente |
| M-06 | HU-002 | Ciclo completo | Completar 4 pomodoros | Aparece "Descanso largo" | — | Pendiente |
| M-07 | HU-003 | Bloquear pantalla | Corriendo, bloquear y desbloquear | El tiempo restante es correcto | — | Pendiente |
| M-08 | HU-003 | Minimizar | Corriendo, ir a inicio y volver | El tiempo restante es correcto | — | Pendiente |
| M-09 | HU-003 | Cerrar desde recientes | Cerrar la app desde recientes y reabrir | La sesión se recupera con el tiempo correcto | — | Pendiente |
| M-10 | HU-003 / HU-004 | Termina con app cerrada | Cerrar la app con el timer corriendo y esperar el fin | Se recibe el aviso; al abrir, la fase queda como terminada | — | Pendiente |
| M-11 | HU-003 | Pausar y cerrar | Pausar, cerrar y reabrir | Sigue en pausa, sin aviso | — | Pendiente |
| M-12 | HU-004 | Reinicio del teléfono | Programar fase, reiniciar el equipo | La alarma vuelve a dispararse (RECEIVE_BOOT_COMPLETED) | — | Pendiente |
| M-13 | HU-004 | Permisos Android 13/14 | Primer arranque en Android 13/14 | Prompt de notificaciones y canal "Pomodoro" creados | — | Pendiente |
| M-14 | HU-004 | Sonido/vibración bloqueado | Esperar fin de fase con pantalla bloqueada | Aviso con sonido y vibración | — | Pendiente |
| M-15 | HU-005 | Guardar válidos | Ajustes → cambiar valores → **Guardar cambios** | Se muestra "Configuración guardada" y persiste tras reabrir | — | Pendiente |
| M-16 | HU-005 | Rechazar inválidos | Dejar vacío / poner 0 / negativo | Mensaje por campo y **no** se guarda | — | Pendiente |
| M-17 | HU-006 | Modo avión | Activar modo avión y usar la app completa | Todo funciona sin conexión | — | Pendiente |
| M-18 | HU-004 | Permiso de alarma exacta | Android 14+, primer arranque sin el permiso | Home muestra la tarjeta "Activa las alarmas exactas"; al pulsar **Abrir ajustes** se abre el ajuste del sistema | — | Pendiente |

## Evidencia

Adjuntar por fila: captura de pantalla o video corto y el valor observado en
"Resultado obtenido".
