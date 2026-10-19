---
name: design-system
description: "Identidad visual Academia Cotopaxi: paleta, tipografía, iconografía, espaciados, componentes y UX. WHEN: construir pantallas/componentes, elegir colores o tipografías, revisar la coherencia visual."
---

# Skill: Academia Cotopaxi Design System

## Purpose

Garantizar que toda la interfaz gráfica mantenga una identidad visual coherente con Academia Cotopaxi.

Esta skill es responsable de:

- Colores
- Tipografía
- Iconografía
- Espaciados
- Componentes visuales
- Experiencia de usuario

No implementa lógica de negocio.

Solo diseño.

---

# Brand Identity

La aplicación debe transmitir:

- Concentración
- Disciplina
- Estudio
- Profesionalismo
- Simplicidad

Evitar apariencia de videojuego.

Evitar exceso de colores.

Evitar interfaces sobrecargadas.

---

# Brand Inspiration

Elementos visuales del logotipo:

- Volcán Cotopaxi
- Sol naciente
- Colores institucionales

La interfaz debe inspirarse en estos elementos sin copiar el logotipo dentro de cada pantalla.

---

# Color Palette

## Primary

Cotopaxi Blue

HEX: #1E1F6E

Uso:

- Botones principales
- Header
- Temporizador
- Iconos importantes

---

## Secondary

Cotopaxi Gold

HEX: #D4A017

Uso:

- Estados activos
- Indicadores
- Elementos destacados

---

## Background

HEX: #FFFFFF

Uso:

- Fondo principal

---

## Surface

HEX: #F5F6FA

Uso:

- Tarjetas
- Contenedores

---

## Text Primary

HEX: #1F2937

---

## Text Secondary

HEX: #6B7280

---

## Success

HEX: #16A34A

---

## Warning

HEX: #F59E0B

---

## Error

HEX: #DC2626

---

# Typography

Preferir:

- Inter
- System Font

Jerarquía:

H1: 32px

H2: 24px

Body: 16px

Caption: 14px

---

# UI Principles

La aplicación debe tener máximo dos pantallas:

1. Home
2. Settings

Reducir navegación innecesaria.

La pantalla principal debe mostrar toda la información importante.

---

# Home Screen

Elementos visibles:

- Estado actual
- Tiempo restante
- Número de pomodoros
- Botón iniciar
- Botón pausar
- Botón reiniciar

El temporizador debe ser el elemento visual dominante.

---

# Timer Design

Formato:

25:00

Estilo:

- Grande
- Centrado
- Color azul institucional

Debe captar inmediatamente la atención.

---

# Buttons

Botón Iniciar

Color:

#1E1F6E

Texto:

Blanco

---

Botón Pausar

Color:

#D4A017

Texto:

#1F2937 (oscuro) — el dorado con texto blanco da 2.4:1 y **no** cumple AA;
con oscuro da 6.2:1 (ver skill `accessibility`). `branding-spec.md` fija la
paleta, no el color del texto.

---

Botón Reiniciar

Color:

#DC2626

Texto:

Blanco

---

# Icons

Preferir:

- Material Community Icons

Iconos recomendados:

play-circle

pause-circle

restart

clock-outline

cog

bell-ring

---

# Pomodoro Indicators

Representación:

● ● ● ●

Color completado:

#D4A017

Color pendiente:

#D1D5DB

---

# Animation Rules

Animaciones suaves.

Duración máxima:

300ms

Evitar:

- Rebotes excesivos
- Animaciones decorativas
- Efectos distraídos

---

# Accessibility

Contraste AA mínimo.

Texto legible.

Botones grandes.

Altura mínima:

48px

---

# Design Constraints

NO usar:

- Gradientes agresivos
- Neón
- Temas oscuros por defecto
- Más de dos colores principales

SI usar:

- Espacios en blanco
- Diseño minimalista
- Componentes limpios
- Layout enfocado en productividad

---

# Glassmorphism (estilo oficial)

La app usa un glassmorfismo **sutil**, subordinado a todas las reglas de este
skill:

- **Superficies de vidrio:** la tarjeta base (`Card`) es vidrio: `BlurView`
  (`expo-blur`) + velo blanco `glass.surface` (alfa ≥ 0.78) + filete
  `glass.border` + sombra suave de la marca. El vidrio aplica solo a
  **contenedores/superficies**.
- **Controles de marca sólidos:** botones, `PhaseBadge` e indicadores de
  pomodoro permanecen con color sólido institucional (el vidrio no se aplica a
  controles interactivos ni a texto de marca).
- **Tokens:** viven en `tokens/glass.ts`. Todos los tonos de vidrio se derivan
  de la paleta oficial con alfa mediante `withAlpha`. **Prohibido** introducir
  colores o tintes nuevos fuera de la paleta.
- **Decoración de fondo:** como máximo dos manchas tenues **estáticas**
  (azul ≤ 0.07 alfa, dorado ≤ 0.10 alfa). Sin gradientes agresivos, sin neón,
  sin brillos/glow y sin animaciones decorativas (reglas de animación y
  restricciones de diseño siguen vigentes). Las decoraciones no se colocan bajo
  bloques de texto secundario.
- **Contraste AA sobre el fondo efectivo:** con `glass.surface` en alfa ≥ 0.78
  sobre fondo blanco, `text` y `textSecondary` cumplen AA; no bajar la alfa del
  velo ni subir los tintes de decoración.
- **Android:** blur estable con `BlurTargetView` (fondo) +
  `blurMethod="dimezisBlurView"` en los `BlurView`; en Android sin método se
  degrada a superficie semitransparente legible.

---

# Expected Output

Cuando se diseñe una nueva pantalla:

1. Aplicar la paleta institucional.
2. Respetar la jerarquía visual.
3. Priorizar simplicidad.
4. Mantener coherencia con el resto de pantallas.