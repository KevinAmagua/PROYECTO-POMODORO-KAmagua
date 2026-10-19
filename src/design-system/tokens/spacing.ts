/**
 * Escala de espaciado, radios y tamaños táctiles.
 *
 * Fuente: `.github/skills/build-ui/design-system/SKILL.md`
 * (layout minimalista, botones grandes) y `.github/skills/build-ui/accessibility`.
 */

/** Escala de espaciado base 4. */
export const spacing = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export type SpacingToken = keyof typeof spacing;

/** Radios de esquina. */
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

/** Tamaños mínimos de interacción (accesibilidad). */
export const size = {
  /** Área táctil mínima exigida (48px). */
  touchTarget: 48,
} as const;
