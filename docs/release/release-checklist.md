# Checklist de release — Academia Cotopaxi Pomodoro

## Identificación

| Campo | Valor |
| --- | --- |
| App | Academia Cotopaxi Pomodoro |
| Plataforma | Android (APK interno / AAB publicación) |
| `version` | `1.0.0` |
| `android.versionCode` | `1` |
| `android.package` | `com.academiacotopaxi.pomodoro` |
| Perfiles EAS | `development`, `preview` (APK), `production` (AAB) |

## Precondiciones

- [ ] `qa` aprobado (automatizado en verde; matriz manual pendiente en dispositivo).
- [x] `reviewer` con veredicto **APROBADO** — ver `docs/review/review-report.md`.
- [x] `npx expo lint` y `npx tsc --noEmit` en verde.
- [x] `npx expo-doctor` sin bloqueantes.

## Diagnóstico (evidencia)

Comandos ejecutados y resultado:

| Comando | Resultado |
| --- | --- |
| `npx expo-doctor` | **21/21 checks passed. No issues detected!** |
| `npx expo lint` | 0 errores, 0 warnings |
| `npx tsc --noEmit` | sin errores |
| `npx jest` | 17 suites · 110 tests · OK |

## Comandos de build

La CLI de EAS se ejecuta con `npx eas-cli@latest` (o `bunx eas-cli` con Bun).

```bash
# 1. Autenticación (una sola vez)
npx eas-cli@latest login

# 2. Vincular el proyecto al account de Expo (una sola vez; escribe extra.eas.projectId en app.json)
npx eas-cli@latest init

# 3. APK de pruebas (distribución interna)
npx eas-cli@latest build --platform android --profile preview

# 4. AAB de publicación
npx eas-cli@latest build --platform android --profile production
```

> El APK/AAB se construye en la nube de EAS; **no** se crean ni editan las
> carpetas `android/`/`ios/` a mano (CNG).

## Checklist de release

- [x] `expo-doctor` sin bloqueantes.
- [x] Lint y typecheck en verde.
- [x] Versión (`1.0.0`) y `versionCode` (`1`) definidos.
- [x] Icono de notificación (`android-icon-monochrome.png`) y plugin `expo-notifications` configurados.
- [x] Permisos Android declarados: `SCHEDULE_EXACT_ALARM`, `VIBRATE` (+ `POST_NOTIFICATIONS` y `RECEIVE_BOOT_COMPLETED` que añade el plugin).
- [x] Permisos del módulo nativo `pomodoro-countdown`: `FOREGROUND_SERVICE`, `FOREGROUND_SERVICE_SPECIAL_USE`, `POST_NOTIFICATIONS`, `SCHEDULE_EXACT_ALARM` (manifiesto del módulo, se fusiona en el build).
- [ ] APK generado e **instalado/verificado** en dispositivo Android.
- [ ] Matriz manual (`docs/qa/manual-test-matrix.md`) ejecutada sobre el build (incluye M-18 … M-21 de HU-007).
- [ ] Artefacto y comandos documentados.

## Versionado

- Fuente de versión: **local** (`appVersionSource: "local"`) → `version`/`versionCode` viven en `app.json`.
- Antes de cada release: incrementar `android.versionCode` (entero) y, si aplica, `version`.

## Verificación sin APK (Expo Go)

Decisión: se **omite por ahora la generación del APK** (EAS) y la verificación
funcional se hace en **Expo Go** (`npx expo start` → escanear el QR con la app en
el dispositivo, misma red local).

- `expo-notifications` soporta **notificaciones locales** en Expo Go (solo se
  deshabilitó push remoto en SDK 53+), así que la app carga y el temporizador
  funciona en primer plano.
- Expo Go **no** aplica nuestro config plugin ni garantiza `SCHEDULE_EXACT_ALARM`
  / `RECEIVE_BOOT_COMPLETED` a nivel de manifiesto; el canal/icono de notificación
  es el de Expo Go, no el propio.

| Escenario | En Expo Go |
| --- | --- |
| M-01 … M-09, M-11, M-15 … M-17 | Verificable |
| M-13 (prompt de permisos) | Verificable (el canal es el de Expo Go) |
| M-10, M-12, M-14 (disparo exacto, reinicio, sonido/vibración en bloqueo) | No fiable → requiere build real |

## Estado actual

Configuración de build **lista**; el **artefacto queda diferido** (no se genera
APK/AAB todavía). A partir de HU-007 la verificación funcional **ya no puede
hacerse en Expo Go** para los escenarios de contador en vivo y alarma exacta:
la app incorpora el módulo nativo `pomodoro-countdown` (servicio en primer plano),
así que requiere un **build nativo**. Pasos 1–4 de *Comandos de build* quedan
**pendientes de credenciales de Expo**; una vez autenticado, `preview` produce un
APK instalable para cerrar la matriz manual (M-10, M-12, M-14, M-18 … M-21).
