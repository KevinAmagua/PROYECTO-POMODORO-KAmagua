/**
 * PomodoroProvider — contexto de React que expone el estado y las acciones del
 * Pomodoro a la presentación (Fase 6).
 *
 * Responsabilidades del wiring:
 *  - construir los servicios una sola vez (`createPomodoroServices`),
 *  - configurar notificaciones y solicitar permisos al arrancar (HU-004),
 *  - cargar la configuración, aplicar sus duraciones al motor (HU-005),
 *  - restaurar la sesión persistida (HU-003),
 *  - suscribir la UI a los cambios de sesión y de configuración.
 *
 * La UI nunca importa infraestructura: solo consume `use-pomodoro` y
 * `use-settings`.
 */

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { timerConfigFromSettings } from '@/features/timer/application';
import type { SessionState } from '@/features/timer/types';
import type { UpdateResult } from '@/features/settings/application';
import type { UserSettings } from '@/features/settings/types';

import { createPomodoroServices, type PomodoroServices } from './pomodoro-services';

export interface PomodoroContextValue {
  /** Estado actual del temporizador. */
  state: SessionState;
  /** Configuración vigente del usuario. */
  settings: UserSettings;
  /** `true` cuando la carga inicial (settings + sesión) terminó. */
  ready: boolean;
  /** `false` si el sistema no permite alarmas exactas (HU-004, Android 12+). */
  exactAlarmsOk: boolean;
  start(): void;
  pause(): void;
  resume(): void;
  reset(): void;
  /** Abre el ajuste de sistema para conceder alarmas exactas. */
  requestExactAlarmsPermission(): Promise<void>;
  /** Valida y persiste un cambio de configuración. */
  updateSettings(patch: Partial<UserSettings>): Promise<UpdateResult>;
}

const PomodoroContext = createContext<PomodoroContextValue | null>(null);

export function PomodoroProvider({ children }: { children: ReactNode }) {
  const [services] = useState<PomodoroServices>(createPomodoroServices);

  const [state, setState] = useState<SessionState>(() => services.session.getState());
  const [settings, setSettings] = useState<UserSettings>(() => services.settings.getSettings());
  const [ready, setReady] = useState(false);
  const [exactAlarmsOk, setExactAlarmsOk] = useState(true);

  useEffect(() => {
    let active = true;

    const unsubscribeSession = services.session.subscribe(setState);
    const unsubscribeSettings = services.settings.subscribe((next) => {
      setSettings(next);
      services.timer.setConfig(timerConfigFromSettings(next));
    });

    const bootstrap = async () => {
      try {
        await services.notifications.configure();
        await services.notifications.requestPermissions();

        const exactOk = await services.notifications.canScheduleExactAlarms();

        const loaded = await services.settings.load();
        services.timer.setConfig(timerConfigFromSettings(loaded));

        await services.session.restore();

        if (active) {
          setExactAlarmsOk(exactOk);
        }
      } finally {
        if (active) {
          setState(services.session.getState());
          setReady(true);
        }
      }
    };

    void bootstrap();

    return () => {
      active = false;
      unsubscribeSession();
      unsubscribeSettings();
      services.session.dispose();
    };
  }, [services]);

  const value = useMemo<PomodoroContextValue>(
    () => ({
      state,
      settings,
      ready,
      exactAlarmsOk,
      start: () => {
        void services.session.start();
      },
      pause: () => {
        void services.session.pause();
      },
      resume: () => {
        void services.session.resume();
      },
      reset: () => {
        void services.session.reset();
      },
      requestExactAlarmsPermission: async () => {
        await services.notifications.requestExactAlarmsPermission();
        setExactAlarmsOk(await services.notifications.canScheduleExactAlarms());
      },
      updateSettings: (patch) => services.settings.update(patch),
    }),
    [state, settings, ready, exactAlarmsOk, services],
  );

  return <PomodoroContext.Provider value={value}>{children}</PomodoroContext.Provider>;
}

/** Acceso al contexto; lanza si se usa fuera del provider. */
export function usePomodoroContext(): PomodoroContextValue {
  const value = useContext(PomodoroContext);
  if (value === null) {
    throw new Error('usePomodoroContext debe usarse dentro de <PomodoroProvider>.');
  }
  return value;
}
