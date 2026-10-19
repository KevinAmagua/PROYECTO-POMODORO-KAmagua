/**
 * Punto de entrada de la infraestructura de notificaciones y alarmas.
 */

export {
  ExpoNotificationService,
  PHASE_CHANNEL_ID,
  VIBRATION_PATTERN,
} from './notification-service';
export type {
  NotificationService,
  ScheduleAtDateOptions,
} from './notification-service';
export { AlarmService } from './alarm-service';
