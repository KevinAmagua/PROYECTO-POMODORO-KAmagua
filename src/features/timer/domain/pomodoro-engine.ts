/**
 * PomodoroEngine — máquina de estados del temporizador.
 *
 * Regla dura (HU-003 / timer-engine-spec): el tiempo restante **siempre** se
 * deriva de `sessionEndTimestamp - Date.now()`. El motor nunca acumula tiempo
 * con contadores ni `setInterval`; quien lo invoca solo llama a `refresh(now)`
 * para detectar expiraciones.
 *
 * Módulo puro: no importa React, Expo ni React Native.
 */

import {
  millisecondsFromSeconds,
  remainingSeconds,
  isExpired,
} from './countdown';
import { nextPhase, phaseDurationSeconds } from './phase-controller';
import { SessionStatus, TimerPhase } from '../types';
import type { SessionState, TimerConfig } from '../types';

/** Estado inicial aceptado por el motor (útil para restaurar desde storage). */
export interface PomodoroEngineOptions {
  config: TimerConfig;
  phase?: TimerPhase;
  status?: SessionStatus;
  /** Segundos restantes (solo relevante si la sesión no está en marcha). */
  remainingSeconds?: number;
  /** Timestamp de fin (solo relevante si la sesión está en marcha). */
  endTimestamp?: number | null;
  /** Timestamp de inicio de la fase (solo relevante si está en marcha/pausada). */
  phaseStartedAt?: number | null;
  completedPomodoros?: number;
}

/** Resultado de la transición tras completar una fase. */
export interface PhaseCompletion {
  /** Fase que acaba de terminar. */
  completedPhase: TimerPhase;
  /** Fase que queda cargada, lista para iniciarse. */
  nextPhase: TimerPhase;
}

export class PomodoroEngine {
  private config: TimerConfig;
  private phase: TimerPhase;
  private status: SessionStatus;
  private remaining: number;
  private endTimestamp: number | null;
  private phaseStartedAt: number | null;
  private completedPomodoros: number;

  constructor(options: PomodoroEngineOptions) {
    this.config = options.config;
    this.phase = options.phase ?? TimerPhase.Study;
    this.status = options.status ?? SessionStatus.Idle;
    this.remaining =
      options.remainingSeconds ?? phaseDurationSeconds(this.config, this.phase);
    this.endTimestamp = options.endTimestamp ?? null;
    this.phaseStartedAt = options.phaseStartedAt ?? null;
    this.completedPomodoros = options.completedPomodoros ?? 0;
  }

  /** Vista de solo lectura del estado, recalculando el tiempo si está en marcha. */
  getSnapshot(now: number): SessionState {
    const remainingTime =
      this.status === SessionStatus.Running && this.endTimestamp !== null
        ? remainingSeconds(this.endTimestamp, now)
        : this.remaining;
    return {
      currentPhase: this.phase,
      status: this.status,
      remainingTime,
      completedPomodoros: this.completedPomodoros,
    };
  }

  /** Timestamp de fin actual (para persistencia); `null` si no está en marcha. */
  getEndTimestamp(): number | null {
    return this.endTimestamp;
  }

  /** Timestamp de inicio de la fase actual; `null` si no se ha iniciado. */
  getPhaseStartedAt(): number | null {
    return this.phaseStartedAt;
  }

  isRunning(): boolean {
    return this.status === SessionStatus.Running;
  }

  isPaused(): boolean {
    return this.status === SessionStatus.Paused;
  }

  /** Inicia o reanuda la fase actual desde el tiempo restante conocido. */
  start(now: number): void {
    if (this.status === SessionStatus.Running) {
      return;
    }
    this.begin(now);
  }

  /** Reanuda una sesión pausada. No-op si no está pausada. */
  resume(now: number): void {
    if (this.status !== SessionStatus.Paused) {
      return;
    }
    this.begin(now);
  }

  /** Pausa la sesión calculando el tiempo restante exacto. No-op si no corre. */
  pause(now: number): void {
    if (this.status !== SessionStatus.Running || this.endTimestamp === null) {
      return;
    }
    this.remaining = remainingSeconds(this.endTimestamp, now);
    this.endTimestamp = null;
    this.status = SessionStatus.Paused;
  }

  /**
   * Reinicia la fase actual a su duración inicial. Conserva la fase y el
   * contador de pomodoros del ciclo (HU-001: "reset" solo reinicia el tiempo).
   */
  reset(): void {
    this.endTimestamp = null;
    this.phaseStartedAt = null;
    this.status = SessionStatus.Idle;
    this.remaining = phaseDurationSeconds(this.config, this.phase);
  }

  /**
   * Detecta la expiración de la fase en marcha. Si expiró, avanza el ciclo y
   * deja la siguiente fase cargada (a la espera de `start`). Devuelve `null`
   * mientras no haya expirado.
   */
  refresh(now: number): PhaseCompletion | null {
    if (this.status !== SessionStatus.Running || this.endTimestamp === null) {
      return null;
    }
    if (!isExpired(this.endTimestamp, now)) {
      return null;
    }

    const completedPhase = this.phase;
    if (completedPhase === TimerPhase.Study) {
      this.completedPomodoros += 1;
    }

    const following = nextPhase(
      completedPhase,
      this.completedPomodoros,
      this.config.pomodorosPerCycle,
    );

    // El ciclo se cierra al terminar un descanso largo: vuelve a empezar.
    if (completedPhase === TimerPhase.LongBreak) {
      this.completedPomodoros = 0;
    }

    this.phase = following;
    this.status = SessionStatus.Finished;
    this.endTimestamp = null;
    this.phaseStartedAt = null;
    this.remaining = phaseDurationSeconds(this.config, this.phase);

    return { completedPhase, nextPhase: following };
  }

  /**
   * Actualiza la configuración. Si la fase actual no está en marcha se ajusta
   * de inmediato su duración; si está corriendo o pausada se respeta el tiempo
   * ya transcurrido.
   */
  setConfig(config: TimerConfig): void {
    this.config = config;
    if (this.status === SessionStatus.Idle || this.status === SessionStatus.Finished) {
      this.remaining = phaseDurationSeconds(this.config, this.phase);
    }
  }

  private begin(now: number): void {
    this.phaseStartedAt = now;
    this.endTimestamp = now + millisecondsFromSeconds(this.remaining);
    this.status = SessionStatus.Running;
  }
}
