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

# Expected Output

Cuando se diseñe una nueva pantalla:

1. Aplicar la paleta institucional.
2. Respetar la jerarquía visual.
3. Priorizar simplicidad.
4. Mantener coherencia con el resto de pantallas.