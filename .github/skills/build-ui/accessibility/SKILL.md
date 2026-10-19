---
name: accessibility
description: "Accesibilidad de la interfaz: contraste, tamaños táctiles, legibilidad y etiquetas. WHEN: construir pantallas/componentes, revisar contraste o validar UX accesible."
---

# Skill: Accessibility

## Purpose

Garantizar que la interfaz es legible y operable para los estudiantes, cumpliendo contraste **AA** mínimo.

## Cuándo usarla

- Al diseñar/implementar pantallas y componentes.
- Como checklist en la revisión (`reviewer`).

## Reglas

- **Contraste AA mínimo** para texto e iconos sobre su fondo (usar la paleta oficial).
- **Área táctil ≥ 48px** en botones e ítems (coincide con `design-system`).
- Texto legible: jerarquía H1 32 / H2 24 / Body 16 / Caption 14.
- No depender solo del color para transmitir estado (acompañar con texto/icono).
- Etiquetas accesibles (`accessibilityLabel`) en botones e iconos sin texto.
- Compatible con escalado de fuente del sistema; evitar recortes.
- Animaciones suaves ≤300 ms, sin movimiento excesivo.

## Checklist

- [ ] Contraste AA verificado en cada combinación texto/fondo.
- [ ] Objetivos táctiles ≥48px.
- [ ] `accessibilityLabel`/`role` en controles.
- [ ] Estado no depende solo del color.
- [ ] Diseño no se rompe con fuente agrandada.
- [ ] Sin animaciones que distraigan o mareen.
