/**
 * Escala tipográfica oficial — Academia Cotopaxi.
 *
 * Fuente: `.github/skills/build-ui/design-system/SKILL.md`.
 * Jerarquía: H1 32 / H2 24 / Body 16 / Caption 14.
 *
 * Tipografía: se usa la fuente del sistema. Integrar una fuente propia (p. ej.
 * Inter) queda fuera del alcance actual para mantener la app liviana y sin
 * dependencias nativas adicionales.
 */

export const fontSize = {
  h1: 32,
  h2: 24,
  body: 16,
  caption: 14,
} as const;

export const lineHeight = {
  h1: 40,
  h2: 32,
  body: 24,
  caption: 20,
} as const;

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

/** Números tabulares para que el temporizador no "salte" al cambiar de dígito. */
export const timerNumberVariant = ['tabular-nums'] as const;

/**
 * Estilo del temporizador: es el elemento visual dominante de la pantalla
 * principal (ver skill `design-system`). Grande, centrado y en azul institucional.
 */
export const timerDisplay = {
  fontSize: 72,
  lineHeight: 80,
  fontWeight: fontWeight.bold,
} as const;

/** Estilos tipográficos listos para `StyleSheet`. */
export const typography = {
  h1: { fontSize: fontSize.h1, lineHeight: lineHeight.h1, fontWeight: fontWeight.bold },
  h2: { fontSize: fontSize.h2, lineHeight: lineHeight.h2, fontWeight: fontWeight.semibold },
  body: { fontSize: fontSize.body, lineHeight: lineHeight.body, fontWeight: fontWeight.medium },
  caption: { fontSize: fontSize.caption, lineHeight: lineHeight.caption, fontWeight: fontWeight.regular },
} as const;

export type TypographyToken = keyof typeof typography;
