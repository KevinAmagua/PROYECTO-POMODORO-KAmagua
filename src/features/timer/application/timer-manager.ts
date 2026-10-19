/**
 * TimerManager — coordinador de la capa de aplicación.
 *
 * Une el `PomodoroEngine` (dominio puro) con:
 *  - un reloj inyectable (`clock`),
 *  - un bucle de refresco de UI (`scheduler` + `tickMs`),
 *  - un canal de suscripción para la presentación,
 *  - un callback `onPhaseCompleted` (gancho para notificaciones, HU-004).
 *
 * El `setInterval` es **solo** un disparador de refresco de la UI; la autoridad
 * del tiempo sigue siendo `endTimestamp - Date.now()` dentro del dominio.
 */

import { PomodoroEngine } from '../domain';
import type { PhaseCompletion } from '../domain';
import { SESSION_SCHEMA_VERSION } from '../types';
import type { PersistentSession, SessionState, TimerConfig } from '../types';

/** Abstracción de temporizador para poder inyectar uno falso en los tests. */
export interface Scheduler {
  setInterval(callback: () => void, ms: number): number;
  clearInterval(handle: number): void;
}

/** Scheduler por defecto basado en los temporizadores globales. */
export const defaultScheduler: Scheduler = {
  setInterval: (callback, ms) => setInterval(callback, ms) as unknown as number,
  clearInterval: (handle) => clearInterval(handle as unknown as ReturnType<typeof setInterval>),
};

export interface TimerManagerOptions {
  config: TimerConfig;
  /** Reloj en milisegundos; por defecto `Date.now`. */
  clock?: () => number;
  /** Periodo del refresco de UI; por defecto 250 ms. */
  tickMs?: number;
  scheduler?: Scheduler;
  /** Se invoca cuando una fase llega a cero (para disparar notificaciones). */
  onPhaseCompleted?: (completion: PhaseCompletion) => void;
}

export type TimerListener = (state: SessionState) => void;

export class TimerManager {
  private engine: PomodoroEngine;
  private config: TimerConfig;
  private readonly clock: () => number;
  private readonly tickMs: number;
  private readonly scheduler: Scheduler;
  private readonly listeners = new Set<TimerListener>();
  private onPhaseCompleted?: (completion: PhaseCompletion) => void;
  private tickHandle: number | null = null;

  constructor(options: TimerManagerOptions) {
    this.config = options.config;
    this.engine = new PomodoroEngine({ config: options.config });
    this.clock = options.clock ?? Date.now;
    this.tickMs = options.tickMs ?? 250;
    this.scheduler = options.scheduler ?? defaultScheduler;
    this.onPhaseCompleted = options.onPhaseCompleted;
  }

  /** Estado actual para la UI. */
  getState(): SessionState {
    return this.engine.getSnapshot(this.clock());
  }

  /** Timestamp de fin de la fase actual (persistencia); `null` si no corre. */
  getEndTimestamp(): number | null {
    return this.engine.getEndTimestamp();
  }

  /** Timestamp de inicio de la fase actual (persistencia); `null` si no inició. */
  getPhaseStartedAt(): number | null {
    return this.engine.getPhaseStartedAt();
  }

  /**
   * Construye la instantánea persistible de la sesión.
   * Para sesiones en marcha, `sessionEndTimestamp` es la autoridad del tiempo.
   */
  serialize(now: number): PersistentSession {
    const snapshot = this.engine.getSnapshot(now);
    const sessionEndTimestamp = this.engine.getEndTimestamp() ?? now;
    const sessionStartTimestamp = this.engine.getPhaseStartedAt() ?? sessionEndTimestamp;
    return {
      sessionStartTimestamp,
      sessionEndTimestamp,
      lastSavedTimestamp: now,
      currentPhase: snapshot.currentPhase,
      status: snapshot.status,
      remainingTime: snapshot.remainingTime,
      completedPomodoros: snapshot.completedPomodoros,
      schemaVersion: SESSION_SCHEMA_VERSION,
    };
  }

  /**
   * Restaura una sesión persistida.
   *
   * Si estaba en marcha y su `sessionEndTimestamp` ya pasó (la app estuvo
   * cerrada), hace avanzar el ciclo igualmente: la fase queda como terminada y
   * se devuelve el `PhaseCompletion` para que se dispare el aviso (HU-003).
   */
  restore(session: PersistentSession): PhaseCompletion | null {
    this.stopTicking();
    this.engine = new PomodoroEngine({
      config: this.config,
      phase: session.currentPhase,
      status: session.status,
      remainingSeconds: session.remainingTime,
      endTimestamp: session.sessionEndTimestamp,
      phaseStartedAt: session.sessionStartTimestamp,
      completedPomodoros: session.completedPomodoros,
    });

    let completion: PhaseCompletion | null = null;
    if (this.engine.isRunning()) {
      completion = this.engine.refresh(this.clock());
      if (!completion) {
        this.ensureTicking();
      }
    }
    this.notify();
    return completion;
  }

  /** Registra un oyente y devuelve la función para cancelarlo. */
  subscribe(listener: TimerListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /** Permite asociar/reemplazar el callback de fin de fase. */
  setOnPhaseCompleted(callback?: (completion: PhaseCompletion) => void): void {
    this.onPhaseCompleted = callback;
  }

  start(): void {
    this.engine.start(this.clock());
    this.ensureTicking();
    this.notify();
  }

  pause(): void {
    this.engine.pause(this.clock());
    this.stopTicking();
    this.notify();
  }

  resume(): void {
    this.engine.resume(this.clock());
    this.ensureTicking();
    this.notify();
  }

  reset(): void {
    this.engine.reset();
    this.stopTicking();
    this.notify();
  }

  setConfig(config: TimerConfig): void {
    this.config = config;
    this.engine.setConfig(config);
    this.notify();
  }

  /** Detiene el bucle de refresco y libera los oyentes. */
  dispose(): void {
    this.stopTicking();
    this.listeners.clear();
  }

  private ensureTicking(): void {
    if (this.tickHandle !== null) {
      return;
    }
    this.tickHandle = this.scheduler.setInterval(this.tick, this.tickMs);
  }

  private stopTicking(): void {
    if (this.tickHandle === null) {
      return;
    }
    this.scheduler.clearInterval(this.tickHandle);
    this.tickHandle = null;
  }

  private readonly tick = (): void => {
    const now = this.clock();
    const completion = this.engine.refresh(now);
    if (completion) {
      this.stopTicking();
    }
    this.notify();
    if (completion) {
      this.onPhaseCompleted?.(completion);
    }
  };

  private notify(): void {
    if (this.listeners.size === 0) {
      return;
    }
    const state = this.engine.getSnapshot(this.clock());
    for (const listener of this.listeners) {
      listener(state);
    }
  }
}
