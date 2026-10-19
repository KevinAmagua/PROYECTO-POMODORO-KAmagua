/**
 * Tokens de glassmorfismo — Academia Cotopaxi.
 *
 * Fuente de verdad: `.github/skills/build-ui/design-system/SKILL.md`
 * (sección "Glassmorphism"). Todos los tonos se derivan de la paleta oficial
 * con alfa; no se introducen colores nuevos.
 *
 * AA verificado: con `surface` en alfa ≥ 0.78 sobre fondo blanco tenue,
 * `colors.text` y `colors.textSecondary` cumplen contraste AA sobre el
 * vidrio. No bajar esa alfa.
 */

import { palette } from './colors';

/** Combina un HEX de la paleta oficial con un alfa (0..1). */
export function withAlpha(hex: string, alpha: number): string {
  const value = hex.replace('#', '');
  const r = Number.parseInt(value.slice(0, 2), 16);
  const g = Number.parseInt(value.slice(2, 4), 16);
  const b = Number.parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export const glass = {
  /** Velo de las tarjetas de vidrio. */
  surface: withAlpha(palette.white, 0.78),
  /** Filete (hairline) derivado del azul institucional. */
  border: withAlpha(palette.cotopaxiBlue, 0.14),
  /** Decoración de fondo: mancha tenue azul (estática). */
  tintBlue: withAlpha(palette.cotopaxiBlue, 0.07),
  /** Decoración de fondo: mancha tenue dorada, "sol naciente" (estática). */
  tintGold: withAlpha(palette.cotopaxiGold, 0.1),
  /** Sombra suave derivada de la marca. */
  shadow: withAlpha(palette.cotopaxiBlue, 0.15),
  /** Intensidad de desenfoque de `expo-blur` (1..100). */
  blurIntensity: 40,
} as const;

export type GlassToken = keyof typeof glass;
