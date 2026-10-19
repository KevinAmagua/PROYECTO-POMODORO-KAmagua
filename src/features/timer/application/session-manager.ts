/**
 * SessionManager — orquestación de la sesión, su persistencia y sus alarmas.
 *
 * Compone un `TimerManager` con un `SessionStore` y un `PhaseAlarm`:
 *  - restaura la sesión persistida al abrir la app (HU-003),
 *  - persiste tras cada cambio relevante (start/pause/resume/reset/fin de fase),
 *  - programa/cancela la alarma exacta de fin de fase (HU-004),
 *  - muestra/oculta el contador en vivo persistente (HU-007),
 *  - reenvía un callback opcional de fin de fase.
 *
 * La UI debe llamar a este manager (no al TimerManager directamente) para que la
 * persistencia y las alarmas ocurran en cada transición.
 */

import type { PhaseCompletion } from '../domain';
import type { TimerListener, TimerManager } from './timer-manager';
import type { SessionStore } from './session-store';
import { noopPhaseAlarm, phaseNotification } from './phase-alarm';
import type { PhaseAlarm } from './phase-alarm';
import { noopCountdownDisplay } from './countdown-display';
import type { CountdownDisplay } from './countdown-display';
import { SessionStatus } from '../types';
import type { SessionState } from '../types';

export interface SessionManagerOptions {
  timer: TimerManager;
  store: SessionStore;
  /** Reloj en milisegundos; por defecto `Date.now`. */
  clock?: () => number;
  /** Servicio de alarma; por defecto una implementación neutra (no-op). */
  alarm?: PhaseAlarm;
  /** Contador en vivo (notificación persistente); por defecto no-op. */
  countdown?: CountdownDisplay;
  /** Se invoca al completar una fase (enganche para notificaciones). */
  onPhaseCompleted?: (completion: PhaseCompletion) => void;
}

/** Resultado de intentar restaurar la sesión al arrancar. */
export interface RestoreResult {
  /** `true` si había una sesión persistida válida. */
  restored: boolean;
  /**
   * Si la fase terminó mientras la app estaba cerrada, describe el cierre;
   * en caso contrario `null`.
   */
  completion: PhaseCompletion | null;
}

export class SessionManager {
  private readonly timer: TimerManager;
  private readonly store: SessionStore;
  private readonly clock: () => number;
  private readonly alarm: PhaseAlarm;
  private readonly countdown: CountdownDisplay;
  private readonly onPhaseCompleted?: (completion: PhaseCompletion) => void;

  constructor(options: SessionManagerOptions) {
    this.timer = options.timer;
    this.store = options.store;
    this.clock = options.clock ?? Date.now;
    this.alarm = options.alarm ?? noopPhaseAlarm;
    this.countdown = options.countdown ?? noopCountdownDisplay;
    this.onPhaseCompleted = options.onPhaseCompleted;
    this.timer.setOnPhaseCompleted(async (completion) => {
      await this.persist();
      await this.safeHideCountdown();
      this.onPhaseCompleted?.(completion);
    });
  }

  /** Estado actual para la UI. */
  getState(): SessionState {
    return this.timer.getState();
  }

  /** Suscripción al refresco de la UI. */
  subscribe(listener: TimerListener): () => void {
    return this.timer.subscribe(listener);
  }

  /** Carga y aplica la sesión persistida, si existe. */
  async restore(): Promise<RestoreResult> {
    const session = await this.store.load();
    if (session === null) {
      return { restored: false, completion: null };
    }
    const completion = this.timer.restore(session);
    await this.persist();
    if (completion === null && this.timer.getState().status === SessionStatus.Running) {
      await this.scheduleAlarm();
      await this.showCountdown();
    } else {
      await this.safeHideCountdown();
    }
    return { restored: true, completion };
  }

  async start(): Promise<void> {
    this.timer.start();
    await this.persist();
    await this.scheduleAlarm();
    await this.showCountdown();
  }

  async pause(): Promise<void> {
    this.timer.pause();
    await this.persist();
    await this.safeCancelAlarm();
    await this.safeHideCountdown();
  }

  async resume(): Promise<void> {
    this.timer.resume();
    await this.persist();
    await this.scheduleAlarm();
    await this.showCountdown();
  }

  async reset(): Promise<void> {
    this.timer.reset();
    await this.persist();
    await this.safeCancelAlarm();
    await this.safeHideCountdown();
  }

  /** Detiene el temporizador y libera oyentes. */
  dispose(): void {
    this.timer.dispose();
  }

  private async scheduleAlarm(): Promise<void> {
    const state = this.timer.getState();
    if (state.status !== SessionStatus.Running) {
      return;
    }
    const endTimestamp = this.timer.getEndTimestamp();
    if (endTimestamp === null) {
      return;
    }
    try {
      await this.alarm.schedule(endTimestamp, phaseNotification(state.currentPhase));
    } catch {
      // La alarma es best-effort: no debe interrumpir la UX del usuario.
    }
  }

  private async safeCancelAlarm(): Promise<void> {
    try {
      await this.alarm.cancel();
    } catch {
      // Cancelación best-effort.
    }
  }

  private async showCountdown(): Promise<void> {
    const state = this.timer.getState();
    if (state.status !== SessionStatus.Running) {
      return;
    }
    const endTimestamp = this.timer.getEndTimestamp();
    if (endTimestamp === null) {
      return;
    }
    try {
      await this.countdown.show(endTimestamp, state.currentPhase);
    } catch {
      // El contador en vivo es best-effort.
    }
  }

  private async safeHideCountdown(): Promise<void> {
    try {
      await this.countdown.hide();
    } catch {
      // Ocultar el contador es best-effort.
    }
  }

  private async persist(): Promise<void> {
    try {
      await this.store.save(this.timer.serialize(this.clock()));
    } catch {
      // La persistencia es best-effort: no debe interrumpir la UX del usuario.
    }
  }
}
