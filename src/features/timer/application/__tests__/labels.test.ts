import { SessionStatus, TimerPhase } from '../../types';
import { phaseLabel, statusLabel } from '../labels';

describe('phaseLabel', () => {
  it('traduce cada fase del ciclo', () => {
    expect(phaseLabel(TimerPhase.Study)).toBe('Estudio');
    expect(phaseLabel(TimerPhase.ShortBreak)).toBe('Descanso corto');
    expect(phaseLabel(TimerPhase.LongBreak)).toBe('Descanso largo');
  });
});

describe('statusLabel', () => {
  it('traduce cada estado del temporizador', () => {
    expect(statusLabel(SessionStatus.Idle)).toBe('Listo para comenzar');
    expect(statusLabel(SessionStatus.Running)).toBe('En curso');
    expect(statusLabel(SessionStatus.Paused)).toBe('En pausa');
    expect(statusLabel(SessionStatus.Finished)).toBe('Fase completada');
  });
});
