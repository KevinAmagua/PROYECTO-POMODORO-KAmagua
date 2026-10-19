# Plan — Notificaciones fiables (HU-004) + contador en vivo (HU-007)

> Artefacto del `planner-agent`. **Pendiente de aprobación del usuario.**
> No se implementa nada hasta que este plan sea aprobado y el `architect`
> produzca el diseño técnico.

## Specs de origen

- HU-004 — Notificaciones y alarmas de fin de fase (`.github/specs/hu-004-notifications.md`)
- HU-007 — Contador en vivo en pantalla bloqueada (`.github/specs/hu-007-live-countdown.md`)
- HU-003 — Background timer (regla `remaining = endTimestamp - Date.now()`)
- HU-006 — Sin red (solo notificaciones locales)

## Alcance

- Corregir la **fiabilidad** del aviso de fin de fase (permisos de alarma exacta,
  verificación, degradación informada).
- Añadir una **notificación persistente en vivo** con el tiempo restante, visible
  en pantalla bloqueada y bandeja, mediante un **servicio en primer plano**.
- Mantener la fuente de verdad del tiempo en timestamps (el servicio solo visualiza).

## Fuera de alcance

- Push remoto / red / backend.
- Controles dentro de la notificación (pausar/reanudar desde la notificación).
- iOS (objetivo Android).

## Tareas

| ID | Descripción | Agente | Depende de | Traza | Salida |
| --- | --- | --- | --- | --- | --- |
| T-01 | Actualizar HU-004 y crear HU-007; corregir skill `local-notifications` (API inexistente) | planner | — | HU-004, HU-007 | specs + skill |
| T-02 | Diseño técnico: contrato del módulo local, config plugin, manejo de permiso de alarma exacta, punto de integración con `SessionManager`/`NotificationService`, decisión alarma exacta vs `setAlarmClock` | architect | T-01 | T-01 | diseño + ADR |
| T-03 | Implementar módulo Expo local: `ForegroundService` + notificación ongoing con countdown nativo + config plugin | mobile | T-02 | HU-007 | `modules/…` |
| T-04 | Gestionar permiso de alarma exacta por vía nativa; verificar alarma programada; eliminar fallo silencioso | mobile | T-02 | HU-004 | infra notificaciones |
| T-05 | Integrar ciclo de vida del contador (start/resume/pause/reset/fin) sin romper HU-003 | mobile | T-03, T-04 | HU-003/007 | application |
| T-06 | (Si el diseño lo pide) mostrar estado de permisos en Ajustes | frontend | T-02 | HU-004 | `settings.tsx` |
| T-07 | Tests unitarios + matriz manual (Android 13/14/15, bloqueo, cierre, Doze, permisos) | qa | T-03..T-06 | HU-004/007 | tests + reporte |
| T-08 | Revisión de código contra specs (quality gate) | reviewer | T-07 | — | veredicto |
| T-09 | Build EAS `preview` + verificación en dispositivo físico | release | T-08 | — | APK |

## Orden de ejecución

```
T-01 → T-02 → T-03 ─┐
              T-04 ─┼→ T-05 → T-06 → T-07 → T-08 → T-09
```

- **Puerta 1:** plan aprobado por el usuario (este documento).
- **Puerta 2:** diseño del `architect` (T-02) aprobado antes de T-03/T-04.
- **Puerta 3:** tests en verde + `expo lint` + `tsc --noEmit` antes de T-08.
- **Puerta 4:** veredicto aprobado del `reviewer` antes de T-09.

## Decisiones (resueltas por el `architect`, ver diseño)

1. **Alarma de fin de fase:** mantener el trigger DATE de `expo-notifications` y
   **solicitar `SCHEDULE_EXACT_ALARM`**. `setAlarmClock()` **no** está exenta del
   permiso (verificado en docs Android 14), así que se descarta. Ver ADR-1 en
   `docs/design/design-notificaciones-cuenta-atras.md`.
2. **Módulo local vs dependencia:** se descarta `notifee` (tercero) por la
   preferencia de Expo modules del proyecto. Ver ADR-2.
3. **Tipo de FGS:** `specialUse` con justificación para temporizador (Android 14+).

## Riesgos

- Autostart / batería por OEM (Samsung, Xiaomi…): documentar y probar en matriz.
- FGS `specialUse` y Play Console: no aplica para APK interno `preview`; dejar
  constancia en el checklist de release.
- Rebuild obligatorio: cualquier cambio nativo exige un nuevo build EAS (no Expo Go).

## Definition of Done (AGENTS.md §8)

- Trazabilidad a HU-004 / HU-007.
- `npx expo lint` y `npx tsc --noEmit` sin errores.
- Tests de `quality/testing-strategy` en verde.
- Sin red ni dependencias no aprobadas.
- Design system y accesibilidad respetados.
- Revisado por `reviewer-agent`.
- Criterios de aceptación de ambas HU cumplidos en dispositivo.
