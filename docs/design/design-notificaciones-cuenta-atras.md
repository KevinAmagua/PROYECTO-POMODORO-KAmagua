# Diseño — Notificaciones fiables (HU-004) + contador en vivo (HU-007)

> Artefacto del `architect-agent`. Entrada: plan aprobado
> `docs/plans/plan-notificaciones-cuenta-atras.md`. **Aprobado por el usuario:
> T-03..T-06 implementados.** Los detalles de la implementación real (firmas
> finales) se anotan al final de este documento.

## 1. Contexto y hallazgos verificados

- `expo-notifications@57.0.23` no expone API para presentar/actualizar una
  notificación mostrada. Solo existe el flag `sticky` (`setOngoing`). Un contador
  en vivo requiere servicio en primer plano (FGS).
- `expo-notifications@57.0.23` **no** expone permiso de alarma exacta
  (`getExactAlarmPermissionsAsync` no existe).
- **Corrección (verificada en docs Android 14):** `SCHEDULE_EXACT_ALARM` es
  obligatorio para `setExact()`, `setExactAndAllowWhileIdle()` **y `setAlarmClock()`**;
  se deniega por defecto para apps `targetSdk >= 33`. `setAlarmClock()` **no**
  está exento. Cambia la pregunta abierta del plan: no hay atajo sin permiso.
- FGS `specialUse`: requiere `FOREGROUND_SERVICE_SPECIAL_USE` + `<property
  android:name="android.app.PROPERTY_SPECIAL_USE_FGS_SUBTYPE">` y pasar
  `FOREGROUND_SERVICE_TYPE_SPECIAL_USE` en `startForeground()` (Android 14+).

## 2. Arquitectura (MVVM simplificado por capas)

```
Presentation (index.tsx, settings.tsx)
      │  use-pomodoro / use-settings
Application (SessionManager)
      │  nuevo puerto CountdownDisplay  +  PhaseAlarm (existente)
Infrastructure
      ├─ ExpoNotificationService (existente, + permiso alarma exacta)
      ├─ AlarmService (existente)
      └─ CountdownNotificationService (nuevo)  →  modules/pomodoro-countdown (FGS nativo)
Domain  (sin cambios; el tiempo sigue siendo endTimestamp - Date.now())
```

- El dominio no cambia: el servicio **solo visualiza**; la verdad es el timestamp.
- La UI sigue sin importar infraestructura.

## 3. Contratos

### 3.1 Puerto de aplicación (nuevo)

`src/features/timer/application/countdown-display.ts`

```ts
import { TimerPhase } from '../types';

export interface CountdownDisplay {
  /** Muestra/actualiza el contador persistente para el fin de fase indicado. */
  show(endTimestamp: number, phase: TimerPhase): Promise<void>;
  /** Oculta el contador (pausa/reinicio/fin). */
  hide(): Promise<void>;
}

export const noopCountdownDisplay: CountdownDisplay = {
  show: async () => {},
  hide: async () => {},
};
```

### 3.2 API del módulo Expo local (nuevo)

`modules/pomodoro-countdown/index.ts`

```ts
export type StartOptions = {
  endTimestamp: number; // epoch ms
  title: string;        // p. ej. "Estudio"
  body: string;         // p. ej. "Tiempo restante"
};

declare class PomodoroCountdownModule {
  start(options: StartOptions): Promise<void>;
  update(endTimestamp: number): Promise<void>;
  stop(): Promise<void>;
  isRunning(): boolean;
  canScheduleExactAlarms(): boolean;
  /** Abre el ajuste de sistema ACTION_REQUEST_SCHEDULE_EXACT_ALARM. */
  requestExactAlarmPermission(): Promise<void>;
}

declare const PomodoroCountdown: PomodoroCountdownModule;
export default PomodoroCountdown;
```

### 3.3 Implementación de infraestructura (nueva)

`src/infrastructure/notifications/countdown-notification-service.ts`
implementa `CountdownDisplay` sobre el módulo local. Debe degradar a no-op si el
módulo no está disponible (Expo Go / web), igual que el patrón actual
`Constants.executionEnvironment`.

### 3.4 Extensión de `NotificationService` (existente)

Añadir a la interfaz y a `ExpoNotificationService`:

```ts
canScheduleExactAlarms(): boolean;          // vía módulo local
requestExactAlarmsPermission(): Promise<void>; // abre ajustes del sistema
```

## 4. Flujo de datos y ciclo de vida

| Evento | `AlarmService` (fin de fase) | `CountdownDisplay` (FGS) |
| --- | --- | --- |
| `start()` | programa alarma exacta (date) | `show(endTimestamp, phase)` |
| `resume()` | reprograma alarma | `show(endTimestamp, phase)` |
| `pause()` | cancela alarma | `hide()` |
| `reset()` | cancela alarma | `hide()` |
| fin de fase | (dispara el aviso) | `hide()` |

Puntos de integración en `SessionManager` (`start/resume/pause/reset` y
`onPhaseCompleted`), siempre best-effort (`try/catch`, no romper UX).

## 5. Detalles nativos (módulo `pomodoro-countdown`)

- `ForegroundTimerService`: `Service` en primer plano.
  - Notificación: canal propio `pomodoro-countdown`, **importance LOW** (sin
    sonido/vibración), `setOngoing(true)`,
    `setUsesChronometer(true)`, `setChronometerCountDown(true)`,
    `setWhen(endTimestamp)`, `lockscreenVisibility: PUBLIC`.
  - Android 13+: exige `POST_NOTIFICATIONS`; 14+: `startForeground(id, n,
    FOREGROUND_SERVICE_TYPE_SPECIAL_USE)` vía `ServiceCompat`.
- `AndroidManifest.xml` del módulo (se fusiona; **no** se edita `android/` a mano):

```xml
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_SPECIAL_USE" />
<application>
  <service android:name=".ForegroundTimerService"
           android:foregroundServiceType="specialUse"
           android:exported="false">
    <property android:name="android.app.PROPERTY_SPECIAL_USE_FGS_SUBTYPE"
              android:value="pomodoro_countdown_timer" />
  </service>
</application>
```

- `expo-module.config.json` registra el módulo Android y su paquete.

## 6. Decisiones técnicas (ADR)

### ADR-1 — Alarma de fin de fase: mantener `expo-notifications` + pedir el permiso exacto

- **Contexto:** las tres APIs exactas requieren `SCHEDULE_EXACT_ALARM`; no hay
  atajo sin permiso. `expo-notifications` ya reprograma tras reinicio.
- **Decisión:** conservar el trigger DATE de `expo-notifications` como única
  autoridad del aviso de fin de fase y **solicitar el permiso especial** con
  `ACTION_REQUEST_SCHEDULE_EXACT_ALARM`, comprobando `canScheduleExactAlarms()`.
- **Consecuencias:** con permiso → exacto; sin permiso → inexacto (best-effort)
  y se informa al usuario. Alternativa descartada: `setAlarmClock()` (mismo
  permiso, más complejo, sin beneficio). Descartar `notifee` (tercero).

### ADR-2 — Contador en vivo con módulo Expo local + FGS `specialUse`

- **Contexto:** `expo-notifications` no puede actualizar una notificación en vivo.
- **Decisión:** módulo local Kotlin con FGS y cronómetro nativo (countdown).
- **Consecuencias:** requiere build nativo (no Expo Go); Play Console revisará el
  `specialUse` (no aplica a APK interno). Descartado: refresco por segundo desde JS.

### ADR-3 — Fuente de verdad del tiempo

- El servicio nativo solo **visualiza** `endTimestamp`. No decide transiciones ni
  escribe storage. Prohibido usar su cronómetro como autoridad.

### ADR-4 — Canal de alarma "perceptible" (defecto reportado 2)

- **Contexto:** el canal `pomodoro-phase` usaba audio `USAGE_NOTIFICATION` (respeta
  el silencio) y los canales son **inmutables**: cambiar `enableVibrate`/patrón en
  código no se aplica a un canal ya creado.
- **Decisión:** crear un canal **nuevo** `pomodoro-alarm` con
  `importance: MAX`, `sound: 'default'`, `audioAttributes: { usage: ALARM,
  contentType: SONIFICATION }`, `vibrationPattern`, `enableVibrate: true`,
  `bypassDnd: true` y `lockscreenVisibility: PUBLIC`. La notificación añade
  `priority: MAX`, `sound` y `vibrate`.
- **Consecuencias:** el aviso se percibe en modo silencio/vibración como una alarma
  del sistema. Verificado: el canal de `expo-notifications` acepta
  `audioAttributes` (`NotificationsChannelSerializer.kt` → `setSound(uri, attrs)`).
  No requiere código nativo nuevo.

### ADR-5 — Acción "Detener" (categoría de notificación)

- **Contexto:** el aviso no tenía acciones ni abría la app.
- **Decisión:** registrar una categoría `pomodoroPhase`
  (`setNotificationCategoryAsync`) con la acción `Detener`
  (`opensAppToForeground: true`) y asociarla al contenido con
  `categoryIdentifier`. El toque por defecto usa el content-intent de
  `expo-notifications`, que abre la app.
- **Consecuencias:** sin `registerTaskAsync`; la acción abre la app y descarta el
  aviso. Alternativa futura: tarea en segundo plano para detener la sesión sin
  abrir la app.

## 7. Riesgos y mitigación

| Riesgo | Mitigación |
| --- | --- |
| OEM mata el FGS / la alarma | Explicar en Ajustes; probar matriz Samsung/Xiaomi; documentar |
| Permiso exacto denegado | Degradar a inexacto + aviso; rechequear en `onResume` |
| `specialUse` rechazado en Play | No aplica a APK interno `preview`; documentar en release |
| Colisión con HU-003 | El FGS no altera persistencia ni cálculo |
| Expo Go | Degradar a no-op (patrón `executionEnvironment`) |

## 8. Contratos para `frontend`

- `use-pomodoro` gana (opcional) `needsExactAlarmPermission: boolean` y
  `requestExactAlarmPermission(): void` para un aviso en Ajustes/Home.
- Sin cambios de design system salvo el acento institucional `#1E1F6E`.

## 9. Trazabilidad

- HU-004 (AC-1..AC-7) → T-04.
- HU-007 (AC-1..AC-7) → T-03, T-05.
- Este diseño cubre el 100% de las tareas T-03..T-06 del plan.

## 10. Implementación (as-built)

Firmas finales, tras implementar T-03..T-06:

- **Módulo nativo** `modules/pomodoro-countdown` (`expo.modules.pomodorocountdown.PomodoroCountdownModule`):
  - `start(endTimestamp: number, title: string, body: string): Promise<void>`
  - `stop(): Promise<void>`
  - `isRunning(): Promise<boolean>` (async: el puente no expone síncronos)
  - `canScheduleExactAlarms(): Promise<boolean>`
  - `requestExactAlarmPermission(): Promise<void>`
  - No se creó `modules/pomodoro-countdown/index.ts`: la infraestructura accede
    por `requireOptionalNativeModule('PomodoroCountdown')` en
    `src/infrastructure/notifications/pomodoro-countdown-native.ts` (evita
    imports fuera de `src/` y degrada a `null`).
- **Puerto** `CountdownDisplay` + `noopCountdownDisplay` + `countdownNotification(phase)`
  en `src/features/timer/application/countdown-display.ts` (los copys viven en la
  capa de aplicación, no en infraestructura).
- **`NotificationService`** extendido con `canScheduleExactAlarms(): Promise<boolean>`,
  `requestExactAlarmsPermission(): Promise<void>` y `listScheduled(): Promise<string[]>`;
  `AlarmService.schedule` verifica (best-effort) que la alarma quedó registrada.
- **`use-pomodoro`** expone `exactAlarmsOk: boolean` y
  `requestExactAlarmsPermission(): Promise<void>` (en lugar de
  `needsExactAlarmPermission`); el aviso se muestra en Home (`index.tsx`).
- **`app.json`**: sin cambios; el permiso `SCHEDULE_EXACT_ALARM` ya estaba y el
  resto los aporta el manifiesto del módulo (se fusiona en el build nativo).
- **Verificación local:** autolinking detecta `pomodoro-countdown`;
  `jest` 17 suites / 110 tests, `tsc`, `expo lint`, `expo-doctor` 21/21 en verde.
- **Pendiente:** build EAS `preview` y matriz manual en dispositivo (T-09).

