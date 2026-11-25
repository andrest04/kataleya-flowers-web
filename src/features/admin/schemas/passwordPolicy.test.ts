import { describe, expect, it } from 'vitest';

import {
  evaluatePasswordCriteria,
  isHardToGuess,
  MIN_PASSWORD_STRENGTH_SCORE,
  PASSWORD_CRITERIA,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  passwordSchema,
  passwordStrengthLabel,
} from './passwordPolicy';

describe('PASSWORD_CRITERIA', () => {
  it('lists the four criteria in display order with Spanish copy', () => {
    expect(PASSWORD_CRITERIA.map((criterion) => criterion.id)).toEqual([
      'length',
      'uppercase',
      'number',
      'special',
    ]);
    for (const criterion of PASSWORD_CRITERIA) {
      expect(criterion.label).not.toBe('');
      expect(criterion.message).not.toBe('');
    }
  });

  it('never mentions the hidden maximum length in user-facing copy', () => {
    const copy = PASSWORD_CRITERIA.flatMap((criterion) => [criterion.label, criterion.message]);
    expect(copy.join(' ')).not.toContain(String(PASSWORD_MAX_LENGTH));
  });
});

describe('evaluatePasswordCriteria', () => {
  it('requires at least 8 characters', () => {
    expect(PASSWORD_MIN_LENGTH).toBe(8);
    expect(evaluatePasswordCriteria('Abcde1!').criteria.length).toBe(false);
    expect(evaluatePasswordCriteria('Abcdef1!').criteria.length).toBe(true);
  });

  it('counts characters by code point, not UTF-16 unit', () => {
    expect(evaluatePasswordCriteria('Ab1!😀😀').criteria.length).toBe(false);
  });

  it('accepts accented and non-Latin uppercase letters', () => {
    expect(evaluatePasswordCriteria('ángel').criteria.uppercase).toBe(false);
    expect(evaluatePasswordCriteria('Ángel').criteria.uppercase).toBe(true);
    expect(evaluatePasswordCriteria('ñandÑ').criteria.uppercase).toBe(true);
    expect(evaluatePasswordCriteria('ωΩ').criteria.uppercase).toBe(true);
  });

  it('detects a number', () => {
    expect(evaluatePasswordCriteria('Abcdefg!').criteria.number).toBe(false);
    expect(evaluatePasswordCriteria('Abcdef7!').criteria.number).toBe(true);
  });

  it('treats symbols and emoji as special characters', () => {
    expect(evaluatePasswordCriteria('abc#').criteria.special).toBe(true);
    expect(evaluatePasswordCriteria('abc_').criteria.special).toBe(true);
    expect(evaluatePasswordCriteria('abc😀').criteria.special).toBe(true);
  });

  it('does not count letters, digits, spaces or combining accents as special', () => {
    expect(evaluatePasswordCriteria('Abc 123').criteria.special).toBe(false);
    expect(evaluatePasswordCriteria('Abc\t123').criteria.special).toBe(false);
    expect(evaluatePasswordCriteria('Café 9').criteria.special).toBe(false);
  });

  it('meets the criteria only when every criterion passes', () => {
    expect(evaluatePasswordCriteria('Abcdef1!').meetsCriteria).toBe(true);
    expect(evaluatePasswordCriteria('abcdef1!').meetsCriteria).toBe(false);
    expect(evaluatePasswordCriteria('Abcdefg!').meetsCriteria).toBe(false);
    expect(evaluatePasswordCriteria('Abcdefg1').meetsCriteria).toBe(false);
    expect(evaluatePasswordCriteria('Abc1!').meetsCriteria).toBe(false);
  });
});

describe('isHardToGuess', () => {
  it('requires a zxcvbn score of at least 3', () => {
    expect(MIN_PASSWORD_STRENGTH_SCORE).toBe(3);
    expect(isHardToGuess(0)).toBe(false);
    expect(isHardToGuess(2)).toBe(false);
    expect(isHardToGuess(3)).toBe(true);
    expect(isHardToGuess(4)).toBe(true);
  });
});

describe('passwordStrengthLabel', () => {
  it('names every zxcvbn score in Spanish', () => {
    expect([0, 1, 2, 3, 4].map((score) => passwordStrengthLabel(score as 0 | 1 | 2 | 3 | 4))).toEqual([
      'Muy débil',
      'Débil',
      'Regular',
      'Buena',
      'Fuerte',
    ]);
  });
});

describe('passwordSchema', () => {
  it('accepts a password that meets every criterion', () => {
    expect(passwordSchema.safeParse('Abcdef1!').success).toBe(true);
  });

  it('rejects 7 characters and accepts 8', () => {
    expect(passwordSchema.safeParse('Abcd1!x').success).toBe(false);
    expect(passwordSchema.safeParse('Abcd1!xy').success).toBe(true);
  });

  it.each([
    ['no uppercase letter', 'abcdef1!', 'uppercase'],
    ['no number', 'Abcdefg!', 'number'],
    ['no special character', 'Abcdefg1', 'special'],
    ['too few characters', 'Ab1!', 'length'],
  ] as const)('rejects a password with %s using that criterion message', (_label, password, id) => {
    const result = passwordSchema.safeParse(password);
    const expected = PASSWORD_CRITERIA.find((criterion) => criterion.id === id)?.message;

    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.message)).toContain(expected);
  });

  it('rejects passwords longer than the hidden maximum with a generic message', () => {
    const tooLong = `Aa1!${'x'.repeat(PASSWORD_MAX_LENGTH)}`;
    const result = passwordSchema.safeParse(tooLong);

    expect(result.success).toBe(false);
    const messages = result.error?.issues.map((issue) => issue.message) ?? [];
    expect(messages.join(' ')).not.toContain(String(PASSWORD_MAX_LENGTH));
  });

  it('accepts a password exactly at the maximum length', () => {
    const atLimit = `Aa1!${'x'.repeat(PASSWORD_MAX_LENGTH - 4)}`;
    expect(passwordSchema.safeParse(atLimit).success).toBe(true);
  });
});
