/**
 * Contexto del fondo de vidrio compartido entre `Screen` y las superficies
 * glass (`Card`).
 *
 * En Android, `BlurView` necesita el `RefObject` del `BlurTargetView` que
 * contiene el fondo; `Screen` lo publica aquí y las tarjetas lo consumen.
 */

import { createContext, useContext, type RefObject } from 'react';
import type { View } from 'react-native';

export type GlassBackdropRef = RefObject<View | null>;

export const GlassBackdropContext = createContext<GlassBackdropRef | null>(null);

/** Ref del fondo a desenfocar; `null` fuera de un `Screen` (degradación semitransparente). */
export function useGlassBackdrop(): GlassBackdropRef | null {
  return useContext(GlassBackdropContext);
}
