/**
 * AlarmService — programa y cancela la alarma exacta de fin de fase (HU-004).
 *
 * Delega en `NotificationService` y mantiene como máximo un aviso programado:
 * al programar cancela los anteriores (incluidos los que hayan quedado
 * registrados en el sistema tras cerrar la app) para evitar duplicados.
 */

import type { PhaseAlarm, PhaseAlarmPayload } from '../../features/timer/application/phase-alarm';
import type { NotificationService } from './notification-service';

export class AlarmService implements PhaseAlarm {
  private identifier: string | null = null;

  constructor(private readonly notifications: NotificationService) {}

  async schedule(endTimestamp: number, payload: PhaseAlarmPayload): Promise<void> {
    await this.notifications.cancelAllScheduled();
    this.identifier = await this.notifications.scheduleAtDate({
      date: endTimestamp,
      title: payload.title,
      body: payload.body,
    });
    await this.verifyScheduled();
  }

  async cancel(): Promise<void> {
    await this.notifications.cancelAllScheduled();
    this.identifier = null;
  }

  /** Identificador del último aviso programado (diagnóstico). */
  getIdentifier(): string | null {
    return this.identifier;
  }

  /**
   * Verifica que la alarma quedó registrada en el sistema (AC-7 de HU-004).
   * Es diagnóstico: nunca lanza, solo avisa si desapareció.
   */
  private async verifyScheduled(): Promise<void> {
    if (this.identifier === null) {
      return;
    }
    try {
      const scheduled = await this.notifications.listScheduled();
      if (!scheduled.includes(this.identifier)) {
        console.warn(
          `La alarma ${this.identifier} no quedó registrada en el sistema. ` +
            'Comprueba el permiso de alarmas exactas.',
        );
      }
    } catch (error) {
      console.warn('No se pudo verificar la alarma programada.', error);
    }
  }
}
