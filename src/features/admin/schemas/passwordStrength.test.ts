import { describe, expect, it } from 'vitest';

import { PASSWORD_CRITERIA, WEAK_PASSWORD_MESSAGE } from './passwordPolicy';
import { estimatePasswordStrength, strongPasswordSchema } from './passwordStrength';

describe('estimatePasswordStrength', () => {
  it.each(['Password1!', 'Qwerty123!', 'Abcdef1!'])(
    'scores the common password %j below the minimum',
    (password) => {
      expect(estimatePasswordStrength(password).score).toBeLessThan(3);
    },
  );

  it('penalizes passwords built from the business name', () => {
    const result = estimatePasswordStrength('Kataleya2024!');

    expect(result.score).toBeLessThan(3);
    expect(result.warning).toMatch(/datos personales/);
  });

  it('returns Spanish feedback for common passwords', () => {
    expect(estimatePasswordStrength('Password1!').warning).toMatch(/contraseña/i);
  });

  it.each(['Tq8$wz!Kp3vX', 'Girasol-Tulipan-94-Lima!'])(
    'scores the unpredictable password %j at 3 or more',
    (password) => {
      expect(estimatePasswordStrength(password).score).toBeGreaterThanOrEqual(3);
    },
  );
});

describe('strongPasswordSchema', () => {
  it('accepts a password that meets every criterion and is hard to guess', () => {
    expect(strongPasswordSchema.safeParse('Tq8$wz!Kp3vX').success).toBe(true);
  });

  it('rejects a password that meets every criterion but is easy to guess', () => {
    const result = strongPasswordSchema.safeParse('Password1!');

    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.message)).toEqual([WEAK_PASSWORD_MESSAGE]);
  });

  it('reports the missing criterion first when the basic rules fail', () => {
    const result = strongPasswordSchema.safeParse('tq8$wz!kp3vx');
    const uppercase = PASSWORD_CRITERIA.find((criterion) => criterion.id === 'uppercase');

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe(uppercase?.message);
  });
});
