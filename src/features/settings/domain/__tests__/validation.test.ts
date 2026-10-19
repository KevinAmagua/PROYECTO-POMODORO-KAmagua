import { SETTINGS_LIMITS, validateSettings, validateSettingsField } from '../validation';
import { DEFAULT_USER_SETTINGS } from '../../types';

describe('validateSettingsField', () => {
  it('acepta valores dentro del rango', () => {
    expect(validateSettingsField('studyDuration', 25)).toBeNull();
    expect(validateSettingsField('pomodorosPerCycle', 4)).toBeNull();
  });

  it('rechaza vacíos (no numérico)', () => {
    expect(validateSettingsField('studyDuration', Number.NaN)).toBe(
      'Ingresa un número entero entre 1 y 180.',
    );
    expect(validateSettingsField('studyDuration', '25')).toBe(
      'Ingresa un número entero entre 1 y 180.',
    );
  });

  it('rechaza cero y negativos con el rango válido', () => {
    expect(validateSettingsField('shortBreakDuration', 0)).toBe('Debe estar entre 1 y 60.');
    expect(validateSettingsField('longBreakDuration', -5)).toBe('Debe estar entre 1 y 120.');
  });

  it('rechaza decimales', () => {
    expect(validateSettingsField('studyDuration', 2.5)).toBe(
      'Ingresa un número entero entre 1 y 180.',
    );
  });

  it('rechaza valores por encima del rango', () => {
    const { min, max } = SETTINGS_LIMITS.studyDuration;
    expect(max).toBe(180);
    expect(validateSettingsField('studyDuration', max + 1)).toBe(
      `Debe estar entre ${min} y ${max}.`,
    );
    expect(SETTINGS_LIMITS.pomodorosPerCycle.max).toBe(10);
    expect(validateSettingsField('pomodorosPerCycle', SETTINGS_LIMITS.pomodorosPerCycle.max + 1)).toBe(
      `Debe estar entre ${SETTINGS_LIMITS.pomodorosPerCycle.min} y ${SETTINGS_LIMITS.pomodorosPerCycle.max}.`,
    );
  });

  it('acepta los límites inclusivos definidos para cada parámetro', () => {
    expect(validateSettingsField('studyDuration', 1)).toBeNull();
    expect(validateSettingsField('studyDuration', 180)).toBeNull();
    expect(validateSettingsField('shortBreakDuration', 1)).toBeNull();
    expect(validateSettingsField('shortBreakDuration', 60)).toBeNull();
    expect(validateSettingsField('longBreakDuration', 1)).toBeNull();
    expect(validateSettingsField('longBreakDuration', 120)).toBeNull();
    expect(validateSettingsField('pomodorosPerCycle', 1)).toBeNull();
    expect(validateSettingsField('pomodorosPerCycle', 10)).toBeNull();
  });
});

describe('validateSettings', () => {
  it('acepta los valores por defecto', () => {
    expect(validateSettings(DEFAULT_USER_SETTINGS)).toEqual({ isValid: true, errors: {} });
  });

  it('reporta el error por campo', () => {
    const result = validateSettings({
      ...DEFAULT_USER_SETTINGS,
      shortBreakDuration: 0,
    });
    expect(result.isValid).toBe(false);
    expect(result.errors).toEqual({ shortBreakDuration: 'Debe estar entre 1 y 60.' });
  });
});
