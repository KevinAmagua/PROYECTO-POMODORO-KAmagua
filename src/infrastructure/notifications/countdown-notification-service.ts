/**
 * CountdownNotificationService — implementa `CountdownDisplay` (HU-007) sobre el
 * módulo nativo `PomodoroCountdown`.
 *
 * Best-effort: si el módulo no está disponible (Expo Go, web, tests) las
 * llamadas se ignoran sin romper la UX.
 */

import { countdownNotification } from '@/features/timer/application/countdown-display';
import type { CountdownDisplay } from '@/features/timer/application/countdown-display';
import type { TimerPhase } from '@/features/timer/types';

import { pomodoroCountdownNative } from './pomodoro-countdown-native';

export class CountdownNotificationService implements CountdownDisplay {
  async show(endTimestamp: number, phase: TimerPhase): Promise<void> {
    if (pomodoroCountdownNative === null) {
      return;
    }
    const { title, body } = countdownNotification(phase);
    await pomodoroCountdownNative.start(endTimestamp, title, body);
  }

  async hide(): Promise<void> {
    if (pomodoroCountdownNative === null) {
      return;
    }
    await pomodoroCountdownNative.stop();
  }
}
