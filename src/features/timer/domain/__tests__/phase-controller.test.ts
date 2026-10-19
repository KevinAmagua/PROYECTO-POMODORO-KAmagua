import { isBreak, nextPhase, phaseDurationSeconds } from '../phase-controller';
import { TimerPhase } from '../../types';
import type { TimerConfig } from '../../types';

const config: TimerConfig = {
  studySeconds: 1500,
  shortBreakSeconds: 300,
  longBreakSeconds: 900,
  pomodorosPerCycle: 4,
};

describe('phase-controller', () => {
  describe('phaseDurationSeconds', () => {
    it('mapea cada fase a su duración', () => {
      expect(phaseDurationSeconds(config, TimerPhase.Study)).toBe(1500);
      expect(phaseDurationSeconds(config, TimerPhase.ShortBreak)).toBe(300);
      expect(phaseDurationSeconds(config, TimerPhase.LongBreak)).toBe(900);
    });
  });

  describe('isBreak', () => {
    it('identifica descansos corto y largo', () => {
      expect(isBreak(TimerPhase.Study)).toBe(false);
      expect(isBreak(TimerPhase.ShortBreak)).toBe(true);
      expect(isBreak(TimerPhase.LongBreak)).toBe(true);
    });
  });

  describe('nextPhase', () => {
    it('va de estudio a descanso corto antes de completar el ciclo', () => {
      expect(nextPhase(TimerPhase.Study, 1, 4)).toBe(TimerPhase.ShortBreak);
    });

    it('va de estudio a descanso largo al completar el ciclo', () => {
      expect(nextPhase(TimerPhase.Study, 4, 4)).toBe(TimerPhase.LongBreak);
      expect(nextPhase(TimerPhase.Study, 5, 4)).toBe(TimerPhase.LongBreak);
    });

    it('vuelve a estudio tras cualquier descanso', () => {
      expect(nextPhase(TimerPhase.ShortBreak, 1, 4)).toBe(TimerPhase.Study);
      expect(nextPhase(TimerPhase.LongBreak, 0, 4)).toBe(TimerPhase.Study);
    });

    it('normaliza pomodorosPerCycle no válidos a 1', () => {
      expect(nextPhase(TimerPhase.Study, 1, 0)).toBe(TimerPhase.LongBreak);
    });
  });
});
