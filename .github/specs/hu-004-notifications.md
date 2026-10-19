# HU-004

## Nombre

Notificaciones y alarmas de fin de fase

## Prioridad

Alta

## Riesgo

Alto

## Objetivo

Alertar al usuario al finalizar una fase (estudio o descanso) con sonido y
vibración, con la app abierta, minimizada o **cerrada**, incluso con la pantalla
bloqueada, de forma **fiable en Android 12–15**.

## Contexto (defecto reportado)

En el APK de `preview` (build `af975ac8`) el usuario concedió el permiso de
notificaciones (`POST_NOTIFICATIONS`), pero **ningún aviso se disparó** con la
app bloqueada/cerrada. El código de programación es correcto: el defecto es de
entorno/permisos y queda **invisible** porque los fallos se capturan con
`try/catch` best-effort (`session-manager.ts:127-129`, `alarm-service.ts:18`).

Causas probables, por orden:

1. **Alarma exacta denegada** (Android 14+): el permiso `SCHEDULE_EXACT_ALARM`
   se deniega por defecto para apps `targetSdk >= 33`. `expo-notifications`
   degrada en silencio a alarma **inexacta**
   (`node_modules/expo-notifications/.../ExpoSchedulingDelegate.kt:106-120`), que
   puede retrasarse mucho en Doze.
2. **Gestión agresiva de batería del fabricante** (Samsung/Xiaomi/Oppo/Vivo…):
   mata el proceso y sus alarmas al cerrar la app.

Contradicción detectada y resuelta: el skill `mobile/local-notifications`
referencia `getExactAlarmPermissionsAsync()` / `requestExactAlarmPermissionsAsync()`,
pero **no existen en `expo-notifications@57.0.23`** (verificado por grep). El
permiso de alarma exacta debe gestionarse por vía nativa (ver HU-007 / diseño).

## Contexto (defecto reportado 2 — alerta perceptible)

Tras conceder permisos, el usuario reporta que el aviso **no vibra** y que **en
modo silencio no se percibe nada**; tampoco aparece un botón **Detener** ni se
abre la app al tocar el aviso. Causas (verificadas en el código nativo de
`expo-notifications@57.0.23`):

- En Android 8+ el sonido y la vibración los controla el **canal**, no la
  notificación. El canal `pomodoro-phase` se creaba con audio tipo
  `USAGE_NOTIFICATION`, que respeta el modo silencio/No molestar.
- Los canales de Android son **inmutables**: una vez creado un canal, cambiar
  `importance`, `vibrationPattern` o `enableVibrate` en código **no tiene efecto**.
  Por eso, en instalaciones previas, la vibración no se activó nunca.
- El aviso no declaraba **categoría/acción** alguna, así que no había botón.

## Requisitos funcionales

- Sonido y vibración al terminar la fase.
- **Percibible incluso con el teléfono en modo silencio o vibración** (audio con
  atributos de alarma, como una alarma del sistema).
- Funcionar con la pantalla bloqueada.
- Funcionar con la aplicación cerrada (desde recientes).
- El aviso debe dispararse **a la hora correcta** y no depender de `setInterval`
  ni de tareas periódicas (regla dura de `AGENTS.md`).
- El usuario debe poder **conceder** el permiso de alarma exacta; si lo deniega,
  la app degrada a alarma inexacta y lo informa (sin romper la UX).
- El aviso debe ofrecer una acción **"Detener"** y abrir la app al tocarlo.

## Criterios de aceptación

- **AC-1** Iniciar una fase y bloquear el teléfono: el aviso suena/vibra a la
  hora programada (tolerancia ≤ 5 s con alarma exacta concedida).
- **AC-2** Cerrar la app desde recientes con una fase en curso: el aviso se
  dispara igualmente.
- **AC-3** Pausar antes de cerrar: **no** se emite aviso; al reabrir, el tiempo
  restante es correcto.
- **AC-4** Reiniciar: se cancela la alarma pendiente; no se emite aviso.
- **AC-5** Si `POST_NOTIFICATIONS` está denegado, la app comunica el estado y no
  falla en silencio.
- **AC-6** Si `SCHEDULE_EXACT_ALARM` no está concedido, la app ofrece llevarte a
  la pantalla de ajustes del sistema para concederlo y registra/expone la
  degradación a `bestEffort`.
- **AC-7** La app verifica que la alarma quedó registrada en el sistema; si no,
  lo informa (sin romper la UX).
- **AC-8** El aviso **vibra** al dispararse (canal con `enableVibrate` y patrón).
- **AC-9** El aviso **se percibe con el teléfono en modo silencio/vibración**
  (canal con `audioAttributes.usage = ALARM`). El canal usa un **id nuevo**
  (`pomodoro-alarm`) para sortear la inmutabilidad de los canales ya creados.
- **AC-10** El aviso muestra una acción **"Detener"** (categoría con acción).
- **AC-11** Tocar el aviso (o su acción) **abre la app**.

## Permisos Android (app.json)

- `POST_NOTIFICATIONS` (Android 13+) — lo añade el plugin `expo-notifications`.
- `SCHEDULE_EXACT_ALARM` (Android 12+) — declarado en `android.permissions`.
- `USE_EXACT_ALARM` **no** se usa: Google Play lo reserva a apps de alarma/calendario.
- `RECEIVE_BOOT_COMPLETED` — lo añade el módulo (repone alarmas tras reinicio).

## Fuera de alcance

- Notificaciones push remotas / red (HU-006).
- El contador en vivo en pantalla bloqueada se especifica en **HU-007**.

## Dependencias

NotificationService
AlarmService

## Trazabilidad

- Implementación actual: `src/infrastructure/notifications/*`,
  `src/features/timer/application/session-manager.ts`.
- Plan: `docs/plans/plan-notificaciones-cuenta-atras.md`.
