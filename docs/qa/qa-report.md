# Reporte de QA — Academia Cotopaxi Pomodoro (Fase 7)

## Entorno

- Expo SDK 57 · React Native 0.86 · React 19 · TypeScript estricto.
- Automatizado: `npx jest` (preset `jest-expo`), AsyncStorage y `expo-notifications` mockeados.
- Manual: **Expo Go** en dispositivo Android físico (sin APK), ver
  `docs/qa/manual-test-matrix.md`. Los escenarios de alarma exacta/reinicio
  quedan para un development build.

## Resultados automatizados

| Comando | Resultado |
| --- | --- |
| `npx jest` | 17 suites · 110 tests · **OK** |
| `npx tsc --noEmit` | Sin errores · **OK** |
| `npx expo lint` | 0 errores · 0 warnings · **OK** |
| `npx expo-doctor` | 21/21 checks · **OK** |

## Cobertura por área (skill `quality/testing-strategy`)

| Área | Archivo de test |
| --- | --- |
| Countdown / bordes | `src/features/timer/domain/__tests__/countdown.test.ts` |
| PomodoroEngine (estados y transiciones) | `src/features/timer/domain/__tests__/pomodoro-engine.test.ts` |
| PhaseController | `src/features/timer/domain/__tests__/phase-controller.test.ts` |
| TimerManager | `src/features/timer/application/__tests__/timer-manager.test.ts` |
| SessionManager (rehidratación RUNNING/PAUSED/FINISHED) | `src/features/timer/application/__tests__/session-manager.test.ts` |
| Alarmas (agendar/cancelar/reprogramar/verificar) | `src/infrastructure/notifications/__tests__/alarm-service.test.ts` |
| Servicio de notificaciones (canal, permiso exacto, listado) | `src/infrastructure/notifications/__tests__/notification-service.test.ts` |
| Contador en vivo — puerto + copys (HU-007) | `src/features/timer/application/__tests__/countdown-display.test.ts` |
| Contador en vivo — servicio nativo (HU-007) | `src/infrastructure/notifications/__tests__/countdown-notification-service.test.ts` |
| Ciclo de vida del contador en `SessionManager` | `src/features/timer/application/__tests__/session-manager.test.ts` |
| Contenido de avisos por fase | `src/features/timer/application/__tests__/phase-alarm.test.ts` |
| Config settings → motor | `src/features/timer/application/__tests__/config.test.ts` |
| Etiquetas de fase/estado | `src/features/timer/application/__tests__/labels.test.ts` |
| Validaciones y defaults de settings | `src/features/settings/domain/__tests__/validation.test.ts`, `.../application/__tests__/settings-manager.test.ts` |
| (De)serialización de repositorios | `src/infrastructure/storage/__tests__/serialization.test.ts`, `repositories.test.ts` |
| Integración del wiring (Fase 6) | `src/providers/__tests__/pomodoro-services.test.ts` |

## Trazabilidad con criterios de aceptación

| HU | Criterio | Evidencia automatizada | Evidencia manual |
| --- | --- | --- | --- |
| HU-001 | Iniciar / pausar / continuar / reiniciar | `pomodoro-engine`, `timer-manager`, `session-manager` | M-01 … M-04 |
| HU-002 | Estudio → corto; 4 → largo; descanso → estudio | ciclo completo en `pomodoro-engine` | M-05, M-06 |
| HU-003 | Corrige con pantalla bloqueada / app cerrada | rehidratación y `now >= endTimestamp ⇒ FINISHED` en `session-manager` | M-07 … M-11 |
| HU-004 | Aviso al terminar cada fase | `alarm-service`, alarmas en `session-manager`, `phase-alarm` | M-10, M-12 … M-14 |
| HU-004 | Permiso de alarma exacta + aviso en Home | `notification-service` (exact-alarm), `pomodoro-services` | M-18 |
| HU-007 | Contador en vivo en pantalla bloqueada | `countdown-display`, `countdown-notification-service`, `session-manager` | M-19 … M-21 |
| HU-005 | Parámetros, validaciones y persistencia | `validation`, `settings-manager`, `config`, integración | M-15, M-16 |
| HU-006 | Sin registro ni red | grep: sin `fetch`/`axios`/analytics ni deps de red en `src/` y `package.json` | M-17 |

## Verificación de HU-006 (offline)

Comando ejecutado sobre `src/` y `package.json`:

```
grep -iE "fetch\(|axios|XMLHttpRequest|http://|https://|analytics|firebase|segment"
```

Sin coincidencias. No hay dependencias de red ni autenticación.

## Defectos

Ninguno crítico o alto detectado en la capa automatizable. Observaciones:

1. **Accesibilidad vs. marca — RESUELTO.** El dorado `#D4A017` con texto
   blanco da 2.4:1 y no cumple AA. `branding-spec.md` solo fija la paleta, así
   que se resolvió a favor de AA: el token `secondaryContrast` es `#1F2937`
   (6.2:1) y se usó en el botón Pausar y el badge secundario. La contradicción
   se corrigió también en `skills/build-ui/design-system/SKILL.md`.
2. **Matriz manual pendiente.** Todos los escenarios de dispositivo (M-01 … M-17)
   requieren ejecución física; ver `docs/qa/manual-test-matrix.md`.
3. **Arranque en Expo Go — RESUELTO.** El import estático de `expo-notifications`
   rompía el arranque en Expo Go (`ExpoTopicSubscriptionModule` ausente). Se
   sustituyó por carga diferida y opcional
   (`src/infrastructure/notifications/notification-service.ts`); el bundle Android
   de Metro compila (`200 OK`).

## Conclusión

La verificación automatizable está en verde (94 tests, `tsc`, `lint`) y cubre
las reglas de negocio de HU-001 … HU-006. La matriz manual se ejecuta en **Expo
Go** para las filas funcionales; los escenarios de disparo exacto en segundo
plano (M-10, M-12, M-14) quedan pendientes de un development build por las
limitaciones de Expo Go. Sigue pendiente el visto bueno a la decisión de
accesibilidad.
