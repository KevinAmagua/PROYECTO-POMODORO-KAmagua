import { TimerManager } from '../timer-manager';
import type { Scheduler } from '../timer-manager';
import { SessionStatus, TimerPhase } from '../../types';
import type { SessionState, TimerConfig } from '../../types';

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

function setup(initialNow = 0) {
  let now = initialNow;
  const scheduler = new FakeScheduler();
  const completions: PhaseCompletionSpy[] = [];
  const manager = new TimerManager({
    config,
    clock: () => now,
    scheduler,
    onPhaseCompleted: (completion) => completions.push(completion),
  });
  return {
    scheduler,
    completions,
    manager,
    advance: (ms: number) => {
      now += ms;
    },
  };
}

type PhaseCompletionSpy = { completedPhase: TimerPhase; nextPhase: TimerPhase };

describe('TimerManager', () => {
  it('arranca en IDLE sin bucle de refresco activo', () => {
    const { manager, scheduler } = setup();
    const state = manager.getState();
    expect(state.status).toBe(SessionStatus.Idle);
    expect(scheduler.activeCount).toBe(0);
  });

  it('inicia la cuenta, programa el refresco y notifica a los oyentes', () => {
    const { manager, scheduler, advance } = setup();
    const states: SessionState[] = [];
    manager.subscribe((state) => states.push(state));

    manager.start();
    expect(scheduler.activeCount).toBe(1);
    expect(manager.getState().status).toBe(SessionStatus.Running);

    advance(2000);
    scheduler.tickAll();
    expect(states.at(-1)?.remainingTime).toBe(3);
  });

  it('al expirar la fase detiene el bucle y dispara onPhaseCompleted', () => {
    const { manager, scheduler, completions, advance } = setup();
    manager.start();

    advance(config.studySeconds * 1000);
    scheduler.tickAll();

    expect(completions).toEqual([
      { completedPhase: TimerPhase.Study, nextPhase: TimerPhase.ShortBreak },
    ]);
    expect(scheduler.activeCount).toBe(0);
    expect(manager.getState().currentPhase).toBe(TimerPhase.ShortBreak);
    expect(manager.getState().status).toBe(SessionStatus.Finished);
  });

  it('pausa detiene el bucle y conserva el restante', () => {
    const { manager, scheduler, advance } = setup();
    manager.start();
    advance(2500);
    manager.pause();

    expect(scheduler.activeCount).toBe(0);
    expect(manager.getState().status).toBe(SessionStatus.Paused);
    expect(manager.getState().remainingTime).toBe(3);
  });

  it('reset vuelve a IDLE con la duración completa y detiene el bucle', () => {
    const { manager, scheduler } = setup();
    manager.start();
    manager.reset();

    expect(scheduler.activeCount).toBe(0);
    expect(manager.getState().status).toBe(SessionStatus.Idle);
    expect(manager.getState().remainingTime).toBe(5);
  });

  it('setConfig actualiza el estado cuando no está en marcha', () => {
    const { manager } = setup();
    manager.setConfig({ ...config, studySeconds: 25 });
    expect(manager.getState().remainingTime).toBe(25);
  });

  it('deja de notificar tras cancelar la suscripción', () => {
    const { manager } = setup();
    const states: SessionState[] = [];
    const unsubscribe = manager.subscribe((state) => states.push(state));
    unsubscribe();
    manager.start();
    expect(states).toHaveLength(0);
  });

  it('dispose detiene el bucle y libera los oyentes', () => {
    const { manager, scheduler } = setup();
    manager.start();
    manager.dispose();
    expect(scheduler.activeCount).toBe(0);
  });
});
