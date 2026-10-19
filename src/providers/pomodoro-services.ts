/**
 * Composición de los servicios de la aplicación (Fase 6).
 *
 * Único lugar donde se cablean las implementaciones de infraestructura con la
 * capa de aplicación. La presentación consume el resultado a través de
 * `PomodoroProvider`, nunca instanciando managers por su cuenta.
 */

import { SessionManager, TimerManager, timerConfigFromSettings } from '@/features/timer/application';
import { SettingsManager } from '@/features/settings/application';
import { SessionRepository, SettingsRepository } from '@/infrastructure/storage';
import {
  AlarmService,
  CountdownNotificationService,
  ExpoNotificationService,
} from '@/infrastructure/notifications';

export interface PomodoroServices {
  notifications: ExpoNotificationService;
  alarm: AlarmService;
  countdown: CountdownNotificationService;
  settings: SettingsManager;
  timer: TimerManager;
  session: SessionManager;
}

/** Construye el grafo de servicios con las dependencias reales de producción. */
export function createPomodoroServices(): PomodoroServices {
  const notifications = new ExpoNotificationService();
  const alarm = new AlarmService(notifications);
  const countdown = new CountdownNotificationService();
  const settings = new SettingsManager({ store: new SettingsRepository() });
  const timer = new TimerManager({
    config: timerConfigFromSettings(settings.getSettings()),
  });
  const session = new SessionManager({
    timer,
    store: new SessionRepository(),
    alarm,
    countdown,
  });

  return { notifications, alarm, countdown, settings, timer, session };
}
