/**
 * Paleta de color oficial — Academia Cotopaxi.
 *
 * Fuente de verdad:
 *  - `.github/specs/branding-spec.md`
 *  - `.github/skills/build-ui/design-system/SKILL.md`
 *
 * Nota: `ui-spec.md` definía una paleta roja (`#8B0000`) que quedó **obsoleta**;
 * prevalece la identidad de marca (Cotopaxi Blue / Cotopaxi Gold).
 */

/** Valores crudos de la marca. No usar directamente en componentes: preferir `colors`. */
export const palette = {
  cotopaxiBlue: '#1E1F6E',
  cotopaxiGold: '#D4A017',
  white: '#FFFFFF',
  surface: '#F5F6FA',
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  success: '#16A34A',
  warning: '#F59E0B',
  error: '#DC2626',
  neutral: '#D1D5DB',
} as const;

export type PaletteColor = keyof typeof palette;

/**
 * Tokens semánticos de color. Es lo que consumen los componentes del
 * design system en fases posteriores.
 */
export const colors = {
  /** Acción principal (botón iniciar, header, temporizador). */
  primary: palette.cotopaxiBlue,
  primaryContrast: palette.white,
  /** Estados activos e indicadores (botón pausar, pomodoros completados). */
  secondary: palette.cotopaxiGold,
  /**
   * Texto sobre el dorado institucional. Es oscuro porque `#D4A017` con blanco
   * da 2.4:1 (falla AA) mientras que con `#1F2937` da 6.2:1 (cumple AA).
   * `branding-spec.md` solo fija la paleta; el color de texto se rige por el
   * skill `accessibility`.
   */
  secondaryContrast: palette.textPrimary,
  /** Fondo principal. */
  background: palette.white,
  /** Tarjetas y contenedores. */
  surface: palette.surface,
  text: palette.textPrimary,
  textSecondary: palette.textSecondary,
  success: palette.success,
  warning: palette.warning,
  /** Acciones destructivas (botón reiniciar). */
  error: palette.error,
  errorContrast: palette.white,
  border: palette.neutral,
  /** Indicador de pomodoro completado / pendiente. */
  pomodoroCompleted: palette.cotopaxiGold,
  pomodoroPending: palette.neutral,
} as const;

export type AppColor = keyof typeof colors;
