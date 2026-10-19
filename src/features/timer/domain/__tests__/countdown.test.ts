import {
  formatDuration,
  isExpired,
  millisecondsFromSeconds,
  minutesToSeconds,
  remainingSeconds,
} from '../countdown';

describe('countdown', () => {
  describe('minutesToSeconds', () => {
    it('convierte minutos a segundos', () => {
      expect(minutesToSeconds(25)).toBe(1500);
      expect(minutesToSeconds(0.5)).toBe(30);
    });
  });

  describe('millisecondsFromSeconds', () => {
    it('convierte segundos a milisegundos', () => {
      expect(millisecondsFromSeconds(5)).toBe(5000);
    });

    it('normaliza valores negativos a cero', () => {
      expect(millisecondsFromSeconds(-3)).toBe(0);
    });
  });

  describe('formatDuration', () => {
    it('formatea como MM:SS con relleno', () => {
      expect(formatDuration(1500)).toBe('25:00');
      expect(formatDuration(65)).toBe('1:05');
      expect(formatDuration(0)).toBe('0:00');
    });

    it('normaliza negativos a 0:00', () => {
      expect(formatDuration(-10)).toBe('0:00');
    });
  });

  describe('remainingSeconds', () => {
    it('calcula desde el timestamp de fin, redondeando hacia arriba', () => {
      expect(remainingSeconds(6000, 1000)).toBe(5);
      expect(remainingSeconds(6000, 2500)).toBe(4);
    });

    it('nunca devuelve valores negativos', () => {
      expect(remainingSeconds(1000, 5000)).toBe(0);
    });
  });

  describe('isExpired', () => {
    it('es falso antes del fin y verdadero al alcanzarlo', () => {
      expect(isExpired(5000, 4999)).toBe(false);
      expect(isExpired(5000, 5000)).toBe(true);
      expect(isExpired(5000, 5001)).toBe(true);
    });
  });
});
