/**
 * Tema de la aplicación — Academia Cotopaxi Pomodoro.
 *
 * Agrupa los design tokens en un único objeto consumible por los componentes.
 * El diseño oficial no contempla tema oscuro por defecto (ver `SKILL.md`),
 * por lo que existe una sola variante clara.
 *
 * Uso previsto: componentes del design system en fases posteriores (Fase 6).
 */

import { colors } from './tokens/colors';
import { glass } from './tokens/glass';
import { radius, size, spacing } from './tokens/spacing';
import { typography } from './tokens/typography';

export const theme = {
  colors,
  glass,
  typography,
  spacing,
  radius,
  size,
} as const;

export type Theme = typeof theme;
