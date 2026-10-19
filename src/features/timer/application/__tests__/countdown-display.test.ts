import { countdownNotification, noopCountdownDisplay } from '../countdown-display';
import { TimerPhase } from '../../types';

describe('countdown-display (HU-007)', () => {
  it('la implementación neutra no lanza', async () => {
    await expect(noopCountdownDisplay.show(1000, TimerPhase.Study)).resolves.toBeUndefined();
    await expect(noopCountdownDisplay.hide()).resolves.toBeUndefined();
  });

  it('devuelve el texto adecuado para cada fase', () => {
    expect(countdownNotification(TimerPhase.Study)).toEqual({
      title: 'Enfoque en curso',
      body: 'Tiempo restante de estudio',
    });
    expect(countdownNotification(TimerPhase.ShortBreak)).toEqual({
      title: 'Descanso corto',
      body: 'Tiempo restante de descanso',
    });
    expect(countdownNotification(TimerPhase.LongBreak)).toEqual({
      title: 'Descanso largo',
      body: 'Tiempo restante de descanso',
    });
  });
});
