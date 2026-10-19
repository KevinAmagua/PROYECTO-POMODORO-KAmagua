import { SessionManager } from '../session-manager';
import { TimerManager } from '../timer-manager';
import type { Scheduler } from '../timer-manager';
import type { SessionStore } from '../session-store';
import type { PhaseAlarm, PhaseAlarmPayload } from '../phase-alarm';
import { SESSION_SCHEMA_VERSION, SessionStatus, TimerPhase } from '../../types';
import type { PersistentSession, TimerConfig } from '../../types';
import type { PhaseCompletion } from '../../domain';

const config: TimerConfig = {
  studySeconds: 5,
  shortBreakSeconds: 3,
  longBreakSeconds: 10,
  pomodorosPerCycle: 2,
};

class FakeScheduler implements Scheduler {
  private callbacks = new Map<number, () => void>();
  private nextId = 1;

  setInterval(callback: () => void): number {
    const id = this.nextId++;
    this.callbacks.set(id, callback);
    return id;
  }

  clearInterval(handle: number): void {
    this.callbacks.delete(handle);
  }

  tickAll(): void {
    for (const callback of [...this.callbacks.values()]) {
      callback();
    }
  }

  get activeCount(): number {
    return this.callbacks.size;
  }
}

class InMemorySessionStore implements SessionStore {
  session: PersistentSession | null = null;
  saves = 0;

  async load(): Promise<PersistentSession | null> {
    return this.session;
  }

  async save(session: PersistentSession): Promise<void> {
    this.session = session;
    this.saves += 1;
  }

  async clear(): Promise<void> {
    this.session = null;
  }
}

class FakePhaseAlarm implements PhaseAlarm {
  scheduled: { endTimestamp: number; payload: PhaseAlarmPayload }[] = [];
  cancelCalls = 0;

  async schedule(endTimestamp: number, payload: PhaseAlarmPayload): Promise<void> {
    this.scheduled.push({ endTimestamp, payload });
  }

  async cancel(): Promise<void> {
    this.cancelCalls += 1;
  }
}

function makeSession(overrides: Partial<PersistentSession> = {}): PersistentSession {
  return {
    sessionStartTimestamp: 0,
    sessionEndTimestamp: 0,
    lastSavedTimestamp: 0,
    currentPhase: TimerPhase.Study,
    status: SessionStatus.Running,
    remainingTime: config.studySeconds,
    completedPomodoros: 0,
    schemaVersion: SESSION_SCHEMA_VERSION,
    ...overrides,
  };
}

const flush = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

function setup(initialNow = 0) {
  let now = initialNow;
  const scheduler = new FakeScheduler();
  const store = new InMemorySessionStore();
  const alarm = new FakePhaseAlarm();
  const completions: PhaseCompletion[] = [];
  const timer = new TimerManager({ config, clock: () => now, scheduler });
  const manager = new SessionManager({
    timer,
    store,
    alarm,
    clock: () => now,
    onPhaseCompleted: (completion) => completions.push(completion),
  });
  return {
    manager,
    timer,
    store,
    alarm,
    scheduler,
    completions,
    advance: (ms: number) => {
      now += ms;
    },
  };
}

describe('SessionManager', () => {
  describe('restore', () => {
    it('no hace nada si no hay sesión persistida', async () => {
      const { manager, store } = setup();
      const result = await manager.restore();
      expect(result).toEqual({ restored: false, completion: null });
      expect(store.session).toBeNull();
    });

    it('restaura una sesión en marcha y reanuda el refresco', async () => {
      const { manager, store, scheduler } = setup(0);
      store.session = makeSession({ sessionEndTimestamp: 20_000, status: SessionStatus.Running });

      const result = await manager.restore();

      expect(result.restored).toBe(true);
      expect(result.completion).toBeNull();
      expect(manager.getState().status).toBe(SessionStatus.Running);
      expect(manager.getState().remainingTime).toBe(20);
      expect(scheduler.activeCount).toBe(1);
    });

    it('marca la fase como terminada si expiró con la app cerrada', async () => {
      const { manager, store, completions } = setup(10_000);
      store.session = makeSession({ sessionEndTimestamp: 1000, status: SessionStatus.Running });

      const result = await manager.restore();

      expect(result.restored).toBe(true);
      expect(result.completion).toEqual({
        completedPhase: TimerPhase.Study,
        nextPhase: TimerPhase.ShortBreak,
      });
      expect(completions).toHaveLength(0);

      const state = manager.getState();
      expect(state.status).toBe(SessionStatus.Finished);
      expect(state.currentPhase).toBe(TimerPhase.ShortBreak);
      expect(state.completedPomodoros).toBe(1);
      // El estado actualizado quedó persistido.
      expect(store.session?.status).toBe(SessionStatus.Finished);
    });

    it('conserva una sesión pausada sin reanudar el refresco', async () => {
      const { manager, store, scheduler } = setup(50_000);
      store.session = makeSession({
        status: SessionStatus.Paused,
        remainingTime: 7,
      });

      await manager.restore();

      expect(manager.getState().status).toBe(SessionStatus.Paused);
      expect(manager.getState().remainingTime).toBe(7);
      expect(scheduler.activeCount).toBe(0);
    });
  });

  describe('persistencia en transiciones', () => {
    it('persiste al iniciar', async () => {
      const { manager, store } = setup(1000);
      await manager.start();
      expect(store.session?.status).toBe(SessionStatus.Running);
      expect(store.session?.sessionEndTimestamp).toBe(6000);
      expect(store.session?.sessionStartTimestamp).toBe(1000);
    });

    it('persiste al pausar con el tiempo restante', async () => {
      const { manager, store, advance } = setup(0);
      await manager.start();
      advance(2000);
      await manager.pause();
      expect(store.session?.status).toBe(SessionStatus.Paused);
      expect(store.session?.remainingTime).toBe(3);
    });

    it('persiste al reiniciar', async () => {
      const { manager, store, advance } = setup(0);
      await manager.start();
      advance(2000);
      await manager.reset();
      expect(store.session?.status).toBe(SessionStatus.Idle);
      expect(store.session?.remainingTime).toBe(config.studySeconds);
    });

    it('persiste y notifica al completar una fase', async () => {
      const { manager, store, completions, scheduler, advance } = setup(0);
      await manager.start();

      advance(config.studySeconds * 1000);
      scheduler.tickAll();
      await flush();

      expect(completions).toEqual([
        { completedPhase: TimerPhase.Study, nextPhase: TimerPhase.ShortBreak },
      ]);
      expect(store.session?.status).toBe(SessionStatus.Finished);
      expect(store.session?.currentPhase).toBe(TimerPhase.ShortBreak);
    });
  });

  describe('alarmas (HU-004)', () => {
    it('programa la alarma al iniciar y al reanudar', async () => {
      const { manager, alarm, advance } = setup(1000);
      await manager.start();
      expect(alarm.scheduled).toEqual([
        {
          endTimestamp: 6000,
          payload: { title: '¡Pomodoro completado!', body: 'Es hora de tomar un descanso.' },
        },
      ]);

      advance(2000);
      await manager.pause();
      advance(1000);
      await manager.resume();
      expect(alarm.scheduled).toHaveLength(2);
      expect(alarm.scheduled[1]).toEqual({
        endTimestamp: 7000,
        payload: { title: '¡Pomodoro completado!', body: 'Es hora de tomar un descanso.' },
      });
    });

    it('cancela la alarma al pausar y al reiniciar', async () => {
      const { manager, alarm } = setup(0);
      await manager.start();
      await manager.pause();
      expect(alarm.cancelCalls).toBe(1);

      await manager.resume();
      await manager.reset();
      expect(alarm.cancelCalls).toBe(2);
    });

    it('programa la alarma al restaurar una sesión en marcha', async () => {
      const { manager, store, alarm } = setup(0);
      store.session = makeSession({ sessionEndTimestamp: 20_000, status: SessionStatus.Running });

      await manager.restore();

      expect(alarm.scheduled).toEqual([
        {
          endTimestamp: 20_000,
          payload: { title: '¡Pomodoro completado!', body: 'Es hora de tomar un descanso.' },
        },
      ]);
    });

    it('no programa alarma si la fase expiró con la app cerrada', async () => {
      const { manager, store, alarm } = setup(10_000);
      store.session = makeSession({ sessionEndTimestamp: 1000, status: SessionStatus.Running });

      await manager.restore();

      expect(alarm.scheduled).toHaveLength(0);
    });

    it('usa el contenido de descanso cuando termina un descanso', async () => {
      const { manager, store, alarm } = setup(0);
      store.session = makeSession({
        currentPhase: TimerPhase.ShortBreak,
        sessionEndTimestamp: 20_000,
        status: SessionStatus.Running,
      });

      await manager.restore();

      expect(alarm.scheduled[0].payload).toEqual({
        title: 'Descanso terminado',
        body: 'Es hora de volver al estudio.',
      });
    });
  });
});
