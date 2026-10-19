import { phaseNotification } from '../phase-alarm';
import { TimerPhase } from '../../types';

describe('phaseNotification', () => {
  it('describe el fin del estudio', () => {
    expect(phaseNotification(TimerPhase.Study)).toEqual({
      title: '¡Pomodoro completado!',
      body: 'Es hora de tomar un descanso.',
    });
  });

  it('describe el fin del descanso corto', () => {
    expect(phaseNotification(TimerPhase.ShortBreak)).toEqual({
      title: 'Descanso terminado',
      body: 'Es hora de volver al estudio.',
    });
  });

  it('describe el fin del descanso largo', () => {
    expect(phaseNotification(TimerPhase.LongBreak)).toEqual({
      title: 'Descanso largo terminado',
      body: 'Empecemos un nuevo ciclo de estudio.',
    });
  });
});
