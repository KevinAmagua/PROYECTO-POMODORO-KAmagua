import { AlarmService } from '../alarm-service';
import type {
  NotificationService,
  ScheduleAtDateOptions,
} from '../notification-service';

class FakeNotificationService implements NotificationService {
  scheduled: ScheduleAtDateOptions[] = [];
  cancelled: string[] = [];
  cancelAllCalls = 0;
  private nextId = 1;

  async configure(): Promise<void> {}

  async hasPermissions(): Promise<boolean> {
    return true;
  }

  async requestPermissions(): Promise<boolean> {
    return true;
  }

  async scheduleAtDate(options: ScheduleAtDateOptions): Promise<string> {
    this.scheduled.push(options);
    return `id-${this.nextId++}`;
  }

  async cancelScheduled(identifier: string): Promise<void> {
    this.cancelled.push(identifier);
  }

  async cancelAllScheduled(): Promise<void> {
    this.cancelAllCalls += 1;
  }

  async canScheduleExactAlarms(): Promise<boolean> {
    return true;
  }

  async requestExactAlarmsPermission(): Promise<void> {}

  async listScheduled(): Promise<string[]> {
    return this.scheduled.map((_, index) => `id-${index + 1}`);
  }
}

describe('AlarmService', () => {
  it('cancela los avisos previos y programa el nuevo', async () => {
    const notifications = new FakeNotificationService();
    const alarm = new AlarmService(notifications);

    await alarm.schedule(5000, { title: 'Título', body: 'Cuerpo' });

    expect(notifications.cancelAllCalls).toBe(1);
    expect(notifications.scheduled).toEqual([
      { date: 5000, title: 'Título', body: 'Cuerpo' },
    ]);
    expect(alarm.getIdentifier()).toBe('id-1');
  });

  it('cancel limpia la alarma pendiente', async () => {
    const notifications = new FakeNotificationService();
    const alarm = new AlarmService(notifications);

    await alarm.schedule(5000, { title: 'T', body: 'B' });
    await alarm.cancel();

    expect(notifications.cancelAllCalls).toBe(2);
    expect(alarm.getIdentifier()).toBeNull();
  });

  it('reprogramar reemplaza la alarma anterior', async () => {
    const notifications = new FakeNotificationService();
    const alarm = new AlarmService(notifications);

    await alarm.schedule(5000, { title: 'A', body: 'A' });
    await alarm.schedule(9000, { title: 'B', body: 'B' });

    expect(notifications.cancelAllCalls).toBe(2);
    expect(notifications.scheduled.map((s) => s.date)).toEqual([5000, 9000]);
    expect(alarm.getIdentifier()).toBe('id-2');
  });

  it('avisa si la alarma no quedó registrada en el sistema', async () => {
    const notifications = new FakeNotificationService();
    notifications.listScheduled = async () => [];
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const alarm = new AlarmService(notifications);

    await alarm.schedule(5000, { title: 'T', body: 'B' });

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('no quedó registrada'));
    warn.mockRestore();
  });

  it('no rompe si la verificación de la alarma falla', async () => {
    const notifications = new FakeNotificationService();
    notifications.listScheduled = async () => {
      throw new Error('sin acceso');
    };
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const alarm = new AlarmService(notifications);

    await expect(alarm.schedule(5000, { title: 'T', body: 'B' })).resolves.toBeUndefined();

    expect(warn).toHaveBeenCalledWith(
      'No se pudo verificar la alarma programada.',
      expect.any(Error),
    );
    warn.mockRestore();
  });
});
