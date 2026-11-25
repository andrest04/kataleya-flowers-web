import { z } from 'zod';

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 256;
export const MIN_PASSWORD_STRENGTH_SCORE = 3;
export const PASSWORD_USER_INPUTS: readonly string[] = ['kataleya', 'flowers'];

export const HARD_TO_GUESS_LABEL = 'Contraseña difícil de adivinar';
export const WEAK_PASSWORD_MESSAGE =
  'Esta contraseña es fácil de adivinar. Prueba con una frase más larga o menos común.';

const UPPERCASE_PATTERN = /\p{Lu}/u;
const NUMBER_PATTERN = /\p{N}/u;
const SPECIAL_PATTERN = /[^\p{L}\p{M}\p{N}\s]/u;

export type PasswordCriterionId = 'length' | 'uppercase' | 'number' | 'special';

export type PasswordStrengthScore = 0 | 1 | 2 | 3 | 4;

export interface PasswordCriterion {
  id: PasswordCriterionId;
  label: string;
  message: string;
  test: (password: string) => boolean;
}

function characterCount(password: string): number {
  return Array.from(password).length;
}

export const PASSWORD_CRITERIA: readonly PasswordCriterion[] = [
  {
    id: 'length',
    label: `Al menos ${PASSWORD_MIN_LENGTH} caracteres`,
    message: `Usa al menos ${PASSWORD_MIN_LENGTH} caracteres.`,
    test: (password) => characterCount(password) >= PASSWORD_MIN_LENGTH,
  },
  {
    id: 'uppercase',
    label: 'Una letra mayúscula',
    message: 'Incluye al menos una letra mayúscula.',
    test: (password) => UPPERCASE_PATTERN.test(password),
  },
  {
    id: 'number',
    label: 'Un número',
    message: 'Incluye al menos un número.',
    test: (password) => NUMBER_PATTERN.test(password),
  },
  {
    id: 'special',
    label: 'Un carácter especial, como ! o #',
    message: 'Incluye al menos un carácter especial, como ! o #.',
    test: (password) => SPECIAL_PATTERN.test(password),
  },
];

export interface PasswordCriteriaEvaluation {
  criteria: Record<PasswordCriterionId, boolean>;
  meetsCriteria: boolean;
}

export function evaluatePasswordCriteria(password: string): PasswordCriteriaEvaluation {
  const criteria: Record<PasswordCriterionId, boolean> = {
    length: false,
    uppercase: false,
    number: false,
    special: false,
  };
  for (const criterion of PASSWORD_CRITERIA) {
    criteria[criterion.id] = criterion.test(password);
  }
  return { criteria, meetsCriteria: Object.values(criteria).every(Boolean) };
}

export function isHardToGuess(score: PasswordStrengthScore): boolean {
  return score >= MIN_PASSWORD_STRENGTH_SCORE;
}

const STRENGTH_LABELS: Record<PasswordStrengthScore, string> = {
  0: 'Muy débil',
  1: 'Débil',
  2: 'Regular',
  3: 'Buena',
  4: 'Fuerte',
};

export function passwordStrengthLabel(score: PasswordStrengthScore): string {
  return STRENGTH_LABELS[score];
}

export const passwordSchema = z
  .string()
  .max(PASSWORD_MAX_LENGTH, 'Esta contraseña es demasiado larga. Usa una más corta.')
  .superRefine((password, context) => {
    for (const criterion of PASSWORD_CRITERIA) {
      if (!criterion.test(password)) {
        context.addIssue({ code: 'custom', message: criterion.message });
      }
    }
  });
