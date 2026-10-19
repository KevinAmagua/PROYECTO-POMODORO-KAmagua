import { countdownNotification } from '@/features/timer/application/countdown-display';
import { TimerPhase } from '@/features/timer/types';

import { CountdownNotificationService } from '../countdown-notification-service';
import { pomodoroCountdownNative } from '../pomodoro-countdown-native';

jest.mock('../pomodoro-countdown-native', () => ({
  pomodoroCountdownNative: {
    start: jest.fn(async () => undefined),
    stop: jest.fn(async () => undefined),
    isRunning: jest.fn(async () => true),
    canScheduleExactAlarms: jest.fn(async () => true),
    requestExactAlarmPermission: jest.fn(async () => undefined),
  },
}));

const startMock = pomodoroCountdownNative!.start as jest.Mock;
const stopMock = pomodoroCountdownNative!.stop as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('CountdownNotificationService (HU-007)', () => {
  it('inicia el contador con el fin de fase y el texto de estudio', async () => {
    const service = new CountdownNotificationService();

    await service.show(60_000, TimerPhase.Study);

    const expected = countdownNotification(TimerPhase.Study);
    expect(startMock).toHaveBeenCalledWith(60_000, expected.title, expected.body);
  });

  it('usa el texto de descanso para las pausas', async () => {
    const service = new CountdownNotificationService();

    await service.show(30_000, TimerPhase.LongBreak);

    const expected = countdownNotification(TimerPhase.LongBreak);
    expect(startMock).toHaveBeenCalledWith(30_000, expected.title, expected.body);
  });

  it('detiene el contador al ocultar', async () => {
    const service = new CountdownNotificationService();

    await service.hide();

    expect(stopMock).toHaveBeenCalledTimes(1);
  });
});
