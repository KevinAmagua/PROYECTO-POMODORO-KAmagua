import {
  parseSession,
  parseUserSettings,
  serializeSession,
  serializeUserSettings,
} from '../serialization';
import { SESSION_SCHEMA_VERSION, SessionStatus, TimerPhase } from '../../../features/timer/types';
import type { PersistentSession } from '../../../features/timer/types';
import { DEFAULT_USER_SETTINGS } from '../../../features/settings/types';

const session: PersistentSession = {
  sessionStartTimestamp: 1000,
  sessionEndTimestamp: 2000,
  lastSavedTimestamp: 1500,
  currentPhase: TimerPhase.Study,
  status: SessionStatus.Running,
  remainingTime: 25,
  completedPomodoros: 2,
  schemaVersion: SESSION_SCHEMA_VERSION,
};

describe('serialization', () => {
  describe('sesión', () => {
    it('hace round-trip de una sesión válida', () => {
      expect(parseSession(serializeSession(session))).toEqual(session);
    });

    it('devuelve null si no hay datos', () => {
      expect(parseSession(null)).toBeNull();
    });

    it('devuelve null ante JSON corrupto', () => {
      expect(parseSession('{no-json')).toBeNull();
    });

    it('devuelve null si la versión de esquema es desconocida', () => {
      expect(parseSession(JSON.stringify({ ...session, schemaVersion: 999 }))).toBeNull();
    });

    it('devuelve null si falta la versión de esquema', () => {
      const { schemaVersion, ...withoutVersion } = session;
      void schemaVersion;
      expect(parseSession(JSON.stringify(withoutVersion))).toBeNull();
    });

    it('devuelve null si una fase o estado es inválido', () => {
      expect(
        parseSession(JSON.stringify({ ...session, currentPhase: 'NOPE' })),
      ).toBeNull();
      expect(
        parseSession(JSON.stringify({ ...session, status: 'NOPE' })),
      ).toBeNull();
    });

    it('devuelve null si faltan campos numéricos', () => {
      const { remainingTime, ...rest } = session;
      void remainingTime;
      expect(parseSession(JSON.stringify(rest))).toBeNull();
    });
  });

  describe('UserSettings', () => {
    it('hace round-trip de settings válidos', () => {
      const settings = { ...DEFAULT_USER_SETTINGS, studyDuration: 30 };
      expect(parseUserSettings(serializeUserSettings(settings))).toEqual(settings);
    });

    it('usa los valores por defecto si no hay datos', () => {
      expect(parseUserSettings(null)).toEqual(DEFAULT_USER_SETTINGS);
    });

    it('usa los valores por defecto ante JSON corrupto', () => {
      expect(parseUserSettings('nope')).toEqual(DEFAULT_USER_SETTINGS);
    });

    it('ignora campos inválidos y conserva los válidos', () => {
      const raw = JSON.stringify({
        studyDuration: 50,
        shortBreakDuration: -3,
        longBreakDuration: 0,
        pomodorosPerCycle: 6,
      });
      expect(parseUserSettings(raw)).toEqual({
        studyDuration: 50,
        shortBreakDuration: DEFAULT_USER_SETTINGS.shortBreakDuration,
        longBreakDuration: DEFAULT_USER_SETTINGS.longBreakDuration,
        pomodorosPerCycle: 6,
      });
    });

    it('restaura defaults para los ajustes persistidos que no cumplen sus límites', () => {
      expect(parseUserSettings(JSON.stringify({
        studyDuration: 181,
        shortBreakDuration: 60.5,
        longBreakDuration: 120,
        pomodorosPerCycle: 11,
      }))).toEqual({
        ...DEFAULT_USER_SETTINGS,
        longBreakDuration: 120,
      });
    });
  });
});
