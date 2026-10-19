# AGENTS.md — Academia Cotopaxi Pomodoro

Este archivo es la **puerta de entrada** para humanos y agentes de IA del proyecto. Léelo completo antes de proponer, planificar o escribir cualquier código. Define qué es el proyecto, dónde vive la verdad, cómo se trabaja (SDD) y cuándo una tarea está terminada.

---

## 1. Qué es este proyecto

Aplicación móvil **Android** basada en la técnica **Pomodoro** para estudiantes de la **Academia Cotopaxi**. Ciclos de estudio y descanso, **100% offline**, sin registro, sin backend y sin publicidad. El rasgo diferencial es que el temporizador **sigue siendo correcto con la pantalla bloqueada, la app minimizada o cerrada**.

Stack: **Expo SDK 57 / React Native 0.86 / React 19 / TypeScript / Expo Router**.

### Restricciones no negociables

- Plataforma objetivo: **Android**.
- **Sin red**: no hay login, cuentas, backend, APIs remotas ni dependencias de conexión (HU-006).
- **Sin publicidad**.
- **Persistencia local** exclusivamente con `AsyncStorage`.
- Uso real **en modo avión**.

---

## 2. Fuentes de verdad (leer antes de decidir)

| Recurso | Ruta | Rol |
| --- | --- | --- |
| Especificaciones | `.github/specs/` | Fuente oficial de requisitos y reglas |
| Historias de usuario | `.github/specs/hu-00*.md` | Criterios de aceptación |
| Agentes | `.github/agents/` | Roles de IA del equipo |
| Skills | `.github/skills/` | Procedimientos especializados reutilizables |
| Este archivo | `AGENTS.md` | Convenciones y workflow |

Mapa de specs: `project-spec.md`, `arquitecture-spec.md`, `data.model-spec.md`, `ui-spec.md`, `branding-spec.md`, `timer-engine-spec.md`, `notification-spec.md`, `storage-spec.md`, `hu-001` … `hu-006`.

> ⚠️ **Conflictos conocidos** (resueltos, no reabrir sin justificación):
> - Paleta oficial = `branding-spec.md` + `skills/build-ui/design-system/SKILL.md` (`#1E1F6E` / `#D4A017`). `ui-spec.md` (rojo `#8B0000`) está **obsoleto**.
> - `notification-spec.md` es un duplicado de `timer-engine-spec.md`; la fuente de notificaciones es `hu-004-notifications.md`.
> - La regla dura: **el tiempo se calcula con timestamps (`remaining = endTimestamp - Date.now()`), nunca con `setInterval` como autoridad.**

Ante una contradicción: prevalece el spec de mayor jerarquía (marca > UI) y, si es ambiguo, **detente y pregunta**; no inventes.

---

## 3. Arquitectura

**MVVM simplificado por capas.** Las pantallas no contienen lógica de negocio.

```
Presentation  →  Application  →  Domain
                      ↘
                        Infrastructure (Storage · Notifications · Alarm)
Domain no depende de nada.
```

- **Presentation** (`src/app`, `src/design-system`): render y despacho de acciones.
- **Application** (`src/features/*/application`): `TimerManager`, `SessionManager`, `SettingsManager`.
- **Domain** (`src/features/timer/domain`): `PomodoroEngine`, `PhaseController`, `CountdownCalculator`. Puro y testeable.
- **Infrastructure** (`src/infrastructure`): `StorageRepository` (AsyncStorage), `NotificationService`, `AlarmService`.

Detalle completo en `.github/specs/arquitecture-spec.md` y en el skill `core/spec-driven-development`.

---

## 4. Workflow de desarrollo (Spec Driven Development)

Ninguna línea de código se escribe sin spec aprobada y plan. Fases y agentes responsables:

```
① Spec        →  planner-agent      (spec + criterios de aceptación)
② Plan        →  planner-agent      (tareas, dependencias, orden)
③ Design      →  architect-agent    (módulos, contratos, modelo de datos, decisiones)
④ Implement   →  mobile-agent / frontend-agent
⑤ Test        →  qa-agent
⑥ Review      →  reviewer-agent     (quality gate: código vs spec)
⑦ Release     →  release-agent      (EAS build / APK)
```

Reglas del workflow:

1. **Un cambio = una spec.** Toda tarea referencia la HU o spec que la origina (trazabilidad).
2. **No se implementa sin plan aprobado** por el usuario.
3. **Los agentes se pasan artefactos**, no conocimiento implícito: spec → plan → design doc → código → tests.
4. **Definition of Done** obligatoria (sección 8).
5. Si algo no está en los specs, **se documenta primero** (spec) y luego se implementa.

Procedimiento detallado: skill `core/spec-driven-development`.

---

## 5. Agentes y cuándo invocarlos

| Agente | Archivo | Úsalo para |
| --- | --- | --- |
| `planner` | `.github/agents/planner-agent.md` | Convertir specs/HU en plan, tareas, dependencias y orden |
| `architect` | `.github/agents/architect-agent.md` | Diseño de módulos, capas, contratos, modelo de datos y decisiones técnicas |
| `mobile` | `.github/agents/mobile-agent.md` | Implementar motor Pomodoro, persistencia, notificaciones, alarmas |
| `frontend` | `.github/agents/frontend-agent.md` | Implementar Home/Settings y componentes del design system |
| `qa` | `.github/agents/qa-agent.md` | Pruebas unitarias, funcionales, integración y matriz manual |
| `reviewer` | `.github/agents/reviewer-agent.md` | Revisión de código contra spec, quality gate (solo lectura) |
| `release` | `.github/agents/release-agent.md` | Configuración de build, `expo-doctor`, APK/EAS release |

### Dependencias entre agentes

```
             ┌──────────────┐
             │ planner      │  (specs → plan)
             └──────┬───────┘
                    ▼
             ┌──────────────┐
             │ architect    │  (plan → diseño técnico)
             └──────┬───────┘
          ┌─────────┴─────────┐
          ▼                   ▼
   ┌──────────────┐    ┌──────────────┐
   │ mobile       │◀──▶│ frontend     │   (mobile define contratos de dominio/estado que frontend consume)
   └──────┬───────┘    └──────┬───────┘
          └─────────┬─────────┘
                    ▼
             ┌──────────────┐
             │ qa           │  (tests sobre la implementación)
             └──────┬───────┘
                    ▼
             ┌──────────────┐
             │ reviewer     │  (gate; puede rechazar y devolver a mobile/frontend)
             └──────┬───────┘
                    ▼
             ┌──────────────┐
             │ release      │  (build/APK)
             └──────────────┘
```

- `planner` y `architect` son **precondición** de los implementadores.
- `frontend` depende de los contratos que expone `mobile` (hooks: `use-pomodoro`, `use-settings`).
- `qa` y `reviewer` dependen de `mobile` + `frontend`.
- `release` es el último eslabón y depende de que `qa` y `reviewer` aprueben.

---

## 6. Skills disponibles

| Skill | Ruta | Uso |
| --- | --- | --- |
| Spec Driven Development | `.github/skills/core/spec-driven-development/SKILL.md` | Workflow completo de fases y artefactos |
| Pomodoro Timer Engine | `.github/skills/mobile/pomodoro-timer-engine/SKILL.md` | Máquina de estados, fases, cálculo por timestamps |
| Background Timer | `.github/skills/mobile/background-timer/SKILL.md` | HU-003: seguir con la app cerrada |
| Local Notifications | `.github/skills/mobile/local-notifications/SKILL.md` | HU-004: notificaciones y alarmas |
| Local Persistence | `.github/skills/mobile/local-persistence/SKILL.md` | AsyncStorage, repositorios, claves |
| Settings Configuration | `.github/skills/mobile/settings-configuration/SKILL.md` | HU-005: parámetros y validaciones |
| Design System | `.github/skills/build-ui/design-system/SKILL.md` | Identidad visual Academia Cotopaxi |
| Accessibility | `.github/skills/build-ui/accessibility/SKILL.md` | Contraste, tamaños táctiles, legibilidad |
| Testing Strategy | `.github/skills/quality/testing-strategy/SKILL.md` | Unitarias, funcionales, integración y manuales |
| Android Release | `.github/skills/release/android-release/SKILL.md` | Config de build y APK |

**Antes de añadir una dependencia o implementar algo con matices, consulta el skill correspondiente.**

---

## 7. Convenciones de código

- **TypeScript estricto.** Sin `any` sin justificación.
- **Expo Router**: rutas solo en `src/app/`; todo lo demás fuera. `_layout.tsx` define navegadores.
- **Nombres**: componentes `PascalCase`, archivos de componentes en `kebab-case.tsx`, hooks `use-*.ts`, dominio en sustantivos claros.
- **Capas**: la UI nunca importa infraestructura directamente; pasa por Application.
- **Dominio puro**: `src/features/timer/domain` no importa React, Expo ni React Native.
- **Sin red**: prohibido `fetch`/`axios`/analytics/ads.
- **Estilo**: sigue los patrones existentes en `src/` antes de crear nuevos.
- **No comentarios innecesarios**; el código debe ser autoexplicativo.

---

## 8. Definition of Done (obligatoria)

Una tarea está terminada solo si:

1. Implementa exactamente la spec/HU referenciada (trazabilidad).
2. Pasa `npx expo lint` y `npx tsc --noEmit` sin errores.
3. Tiene las pruebas definidas por el skill `quality/testing-strategy`.
4. No introduce dependencias de red ni paquetes fuera de los aprobados.
5. Respeta el design system y la accesibilidad.
6. Fue revisada por `reviewer-agent`.
7. Cumple los criterios de aceptación de la HU.

---

## 9. Comandos

Usa `bunx` en lugar de `npx` si el proyecto usa bun (`bun.lock` presente).

```bash
npx expo install <package>  # SIEMPRE en lugar de npm/yarn/pnpm/bun add — resuelve versiones compatibles con el SDK
npx expo start              # inicia el servidor de desarrollo
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnostica dependencias y configuración
npx expo install --fix      # corrige versiones incompatibles
npx expo run:android        # build local de desarrollo
```

Ejecuta lint y typecheck antes de declarar cualquier tarea terminada.

---

## 10. Expo / React Native: no confíes en tu entrenamiento

Expo publica cambios de ruptura en cada SDK. Las APIs que recuerdas probablemente cambian de nombre, se mueven o se eliminan. Antes de escribir código que use una API de Expo, EAS o React Native:

1. Lee la versión mayor de `expo` en `package.json` (**actualmente 57**).
2. Consulta la documentación versionada: `https://docs.expo.dev/versions/v57.0.0/`.
3. Para cualquier otra cosa, usa `https://docs.expo.dev/llms.txt` — índice de toda la documentación de Expo con correcciones a conceptos erróneos comunes. Sigue sus enlaces; nunca respondas de memoria.

### Navegación y routing

- Usa **Expo Router** para toda la navegación. Rutas en `src/app/`; mantén fuera de `src/app/` el código que no es ruta (componentes, hooks, utilidades).
- Importa `Link`, `router` y `useLocalSearchParams` desde `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

### Building con EAS

Usa EAS para construir, firmar y publicar en la nube (`eas build`, `eas submit`) y para enviar actualizaciones OTA (`eas update`) — sin Xcode ni Android Studio local. Ejecuta la CLI como `bunx eas-cli <command>` en Bun, o `npx eas-cli@latest <command>` en otros casos.
Docs: https://docs.expo.dev/eas/index.md

### Reglas Expo

- Si no existen `ios/` y `android/`, se generan (Continuous Native Generation). **Nunca crees ni edites esas carpetas a mano** — configura el comportamiento nativo en `app.json` y config plugins.
- Expo Go solo incluye sus módulos nativos. Tras añadir una librería con código nativo, la app requiere un development build: `npx expo run:android` local, o `eas build --profile development`.
- Prefiere módulos recomendados de Expo antes que librerías de terceros y consulta tus skills antes de añadir dependencias. Docs: https://docs.expo.dev/versions/latest/index.md

---

## 11. Guardrails

- No implementes sin spec + plan aprobados.
- No añadas backend, login, ads ni red (HU-006).
- No uses `setInterval` como fuente de verdad del tiempo (HU-003).
- No confíes en tareas periódicas en background para disparar a hora exacta: usa alarmas de sistema (HU-004).
- No introduzcas colores, tipografías o componentes fuera del design system.
- No edites `ios/`/`android/` a mano.
- No marques una tarea como hecha sin `expo lint`, `tsc --noEmit` y tests en verde.
