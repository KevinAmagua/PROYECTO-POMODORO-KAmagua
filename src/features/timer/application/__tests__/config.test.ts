import { timerConfigFromSettings } from '../config';
import { DEFAULT_USER_SETTINGS } from '../../../settings/types';
import type { UserSettings } from '../../../settings/types';

const settings: UserSettings = {
  studyDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  pomodorosPerCycle: 4,
};

describe('timerConfigFromSettings', () => {
  it('convierte las duraciones de minutos a segundos', () => {
    expect(timerConfigFromSettings(settings)).toEqual({
      studySeconds: 1500,
      shortBreakSeconds: 300,
      longBreakSeconds: 900,
      pomodorosPerCycle: 4,
    });
  });

  it('garantiza al menos un pomodoro por ciclo', () => {
    const config = timerConfigFromSettings({ ...DEFAULT_USER_SETTINGS, pomodorosPerCycle: 0 });
    expect(config.pomodorosPerCycle).toBe(1);
  });

  it('trunca los pomodoros fraccionarios', () => {
    const config = timerConfigFromSettings({ ...DEFAULT_USER_SETTINGS, pomodorosPerCycle: 3.9 });
    expect(config.pomodorosPerCycle).toBe(3);
  });
});
