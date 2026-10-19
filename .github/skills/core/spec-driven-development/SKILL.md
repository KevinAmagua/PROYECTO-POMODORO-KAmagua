---
name: spec-driven-development
description: "Workflow oficial SDD del proyecto: fases, artefactos, agentes y puertas de calidad. WHEN: \"planificar una HU\", \"iniciar un cambio\", \"diseño técnico\", \"pasar a implementación\", \"revisar antes de release\"."
---

# Skill: Spec Driven Development

## Purpose

Garantizar que **ninguna línea de código se escribe sin especificación aprobada y plan**. Define el flujo, los artefactos y las puertas de calidad del proyecto Academia Cotopaxi Pomodoro.

## Cuándo usarla

- Al iniciar cualquier cambio o historia de usuario.
- Al pasar de una fase a otra (spec → plan → design → implement → test → review → release).
- Al dudar sobre qué artefacto produce cada agente.

## Fases y artefactos

```
① Spec        → planner-agent     → spec del cambio + criterios de aceptación
② Plan        → planner-agent     → tareas, dependencias, orden (aprobado por el usuario)
③ Design      → architect-agent   → módulos, contratos, modelo de datos, riesgos (ADR)
④ Implement   → mobile-agent      → dominio/aplicación/infraestructura + hooks
                frontend-agent     → pantallas + design system
⑤ Test        → qa-agent          → tests + matriz manual + reporte
⑥ Review      → reviewer-agent    → veredicto APROBADO/RECHAZADO (solo lectura)
⑦ Release     → release-agent     → EAS build / APK
```

## Reglas del flujo

1. **Un cambio = una spec** con trazabilidad a una HU (`hu-00*.md`).
2. **Puertas no negociables**: no se implementa sin plan aprobado; no se revisa sin tests; no se libera sin aprobación de `reviewer`.
3. **Artefactos, no conocimiento implícito**: cada agente recibe la salida del anterior.
4. **Contradicciones**: prevalece el spec de mayor jerarquía (marca > UI); si es ambiguo, **detente y pregunta**.
5. Si falta un requisito: **documentarlo primero** (spec) y luego implementar.

## Fuentes de verdad

- `.github/specs/` (project, arquitectura, modelo de datos, UI, branding, timer, storage, notificaciones, HU-001…006).
- `AGENTS.md` (convenciones, DoD, guardrails).

## Puerta de calidad (resumen del DoD)

- Trazabilidad a la spec/HU.
- `npx expo lint` y `npx tsc --noEmit` sin errores.
- Tests del `quality/testing-strategy` en verde.
- Sin red ni dependencias no aprobadas.
- Design system y accesibilidad respetados.
- Revisado por `reviewer-agent`.

## Rol de cada agente

| Fase | Agente | Entrada | Salida |
| --- | --- | --- | --- |
| Spec/Plan | `planner` | HU/spec | spec + plan |
| Design | `architect` | plan aprobado | diseño + contratos |
| Implement | `mobile` / `frontend` | diseño | código + tests unitarios |
| Test | `qa` | código | suite + matriz manual |
| Review | `reviewer` | código + tests | veredicto |
| Release | `release` | aprobación | APK/AAB |

## Checklist

- [ ] Spec/HU identificada y sin ambigüedades.
- [ ] Plan aprobado por el usuario.
- [ ] Diseño con contratos claros para mobile y frontend.
- [ ] Implementación sin dependencias de red.
- [ ] Tests en verde y `tsc --noEmit` limpio.
- [ ] Veredicto del reviewer.
- [ ] Build verificado en dispositivo.
