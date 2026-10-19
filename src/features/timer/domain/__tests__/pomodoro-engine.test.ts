import { PomodoroEngine } from '../pomodoro-engine';
import { SessionStatus, TimerPhase } from '../../types';
import type { TimerConfig } from '../../types';

const config: TimerConfig = {
  studySeconds: 5,
  shortBreakSeconds: 3,
  longBreakSeconds: 10,
  pomodorosPerCycle: 2,
};

describe('PomodoroEngine', () => {
  it('arranca en IDLE con la duración completa de estudio', () => {
    const engine = new PomodoroEngine({ config });
    const snapshot = engine.getSnapshot(1000);
    expect(snapshot.status).toBe(SessionStatus.Idle);
    expect(snapshot.currentPhase).toBe(TimerPhase.Study);
    expect(snapshot.remainingTime).toBe(5);
    expect(snapshot.completedPomodoros).toBe(0);
  });

  it('inicia la cuenta y calcula el restante por timestamp', () => {
    const engine = new PomodoroEngine({ config });
    engine.start(1000);
    expect(engine.isRunning()).toBe(true);
    expect(engine.getSnapshot(1000).remainingTime).toBe(5);
    expect(engine.getSnapshot(3000).remainingTime).toBe(3);
  });

  it('pausa capturando el restante exacto y reanuda sin perder tiempo', () => {
    const engine = new PomodoroEngine({ config });
    engine.start(1000);
    engine.pause(2500);
    expect(engine.isPaused()).toBe(true);
    expect(engine.getSnapshot(9999).remainingTime).toBe(4);

    engine.resume(10_000);
    expect(engine.isRunning()).toBe(true);
    expect(engine.getSnapshot(10_000).remainingTime).toBe(4);
    expect(engine.getSnapshot(12_000).remainingTime).toBe(2);
  });

  it('refresh no hace nada si la fase sigue en curso', () => {
    const engine = new PomodoroEngine({ config });
    engine.start(1000);
    expect(engine.refresh(3000)).toBeNull();
  });

  it('al expirar un estudio avanza al descanso corto y suma un pomodoro', () => {
    const engine = new PomodoroEngine({ config });
    engine.start(1000);
    const completion = engine.refresh(6000);
    expect(completion).toEqual({
      completedPhase: TimerPhase.Study,
      nextPhase: TimerPhase.ShortBreak,
    });
    const snapshot = engine.getSnapshot(6000);
    expect(snapshot.status).toBe(SessionStatus.Finished);
    expect(snapshot.currentPhase).toBe(TimerPhase.ShortBreak);
    expect(snapshot.remainingTime).toBe(3);
    expect(snapshot.completedPomodoros).toBe(1);
    expect(engine.isRunning()).toBe(false);
  });

  it('usa descanso largo al completar el ciclo y reinicia el contador', () => {
    const engine = new PomodoroEngine({ config });

    // Pomodoro 1: estudio -> descanso corto.
    engine.start(0);
    engine.refresh(config.studySeconds * 1000);
    expect(engine.getSnapshot(0).currentPhase).toBe(TimerPhase.ShortBreak);

    // El descanso corto termina -> nuevo estudio.
    const shortBreakStart = config.studySeconds * 1000;
    engine.start(shortBreakStart);
    const shortBreakEnd = shortBreakStart + config.shortBreakSeconds * 1000;
    engine.refresh(shortBreakEnd);
    expect(engine.getSnapshot(0).currentPhase).toBe(TimerPhase.Study);

    // Pomodoro 2: completa el ciclo -> descanso largo.
    engine.start(shortBreakEnd);
    const secondStudyEnd = shortBreakEnd + config.studySeconds * 1000;
    engine.refresh(secondStudyEnd);
    const afterCycle = engine.getSnapshot(secondStudyEnd);
    expect(afterCycle.currentPhase).toBe(TimerPhase.LongBreak);
    expect(afterCycle.completedPomodoros).toBe(2);

    // El descanso largo termina: vuelve a estudio y reinicia el ciclo.
    engine.start(secondStudyEnd);
    const longBreakEnd = secondStudyEnd + config.longBreakSeconds * 1000;
    const completion = engine.refresh(longBreakEnd);
    expect(completion).toEqual({
      completedPhase: TimerPhase.LongBreak,
      nextPhase: TimerPhase.Study,
    });
    const snapshot = engine.getSnapshot(longBreakEnd);
    expect(snapshot.currentPhase).toBe(TimerPhase.Study);
    expect(snapshot.completedPomodoros).toBe(0);
    expect(snapshot.remainingTime).toBe(5);
  });

  it('reset devuelve la fase actual a su duración inicial sin perder el ciclo', () => {
    const engine = new PomodoroEngine({ config });
    engine.start(1000);
    engine.refresh(6000); // completa estudio -> descanso corto, 1 pomodoro
    engine.start(6000);
    engine.reset();

    const snapshot = engine.getSnapshot(20_000);
    expect(snapshot.status).toBe(SessionStatus.Idle);
    expect(snapshot.currentPhase).toBe(TimerPhase.ShortBreak);
    expect(snapshot.remainingTime).toBe(3);
    expect(snapshot.completedPomodoros).toBe(1);
  });

  it('setConfig ajusta la duración solo cuando la fase no está en marcha', () => {
    const engine = new PomodoroEngine({ config });
    engine.setConfig({ ...config, studySeconds: 25 });
    expect(engine.getSnapshot(0).remainingTime).toBe(25);

    engine.start(0);
    engine.setConfig({ ...config, studySeconds: 30 });
    expect(engine.getSnapshot(0).remainingTime).toBe(25);
  });

  it('permite restaurar una sesión en marcha desde un timestamp de fin', () => {
    const engine = new PomodoroEngine({
      config,
      status: SessionStatus.Running,
      endTimestamp: 20_000,
    });
    expect(engine.isRunning()).toBe(true);
    expect(engine.getSnapshot(15_000).remainingTime).toBe(5);
    expect(engine.getEndTimestamp()).toBe(20_000);
  });
});
