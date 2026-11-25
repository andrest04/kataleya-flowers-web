import { ZxcvbnFactory } from '@zxcvbn-ts/core';
import * as zxcvbnCommon from '@zxcvbn-ts/language-common';
import * as zxcvbnSpanish from '@zxcvbn-ts/language-es-es';

import type { PasswordStrengthScore } from './passwordPolicy';
import {
  isHardToGuess,
  PASSWORD_USER_INPUTS,
  passwordSchema,
  WEAK_PASSWORD_MESSAGE,
} from './passwordPolicy';

const zxcvbn = new ZxcvbnFactory({
  dictionary: { ...zxcvbnCommon.dictionary, ...zxcvbnSpanish.dictionary },
  graphs: zxcvbnCommon.adjacencyGraphs,
  translations: zxcvbnSpanish.translations,
});

export interface PasswordStrengthEstimate {
  score: PasswordStrengthScore;
  warning: string | null;
}

export function estimatePasswordStrength(password: string): PasswordStrengthEstimate {
  const result = zxcvbn.check(password, [...PASSWORD_USER_INPUTS]);
  return { score: result.score, warning: result.feedback.warning || null };
}

export const strongPasswordSchema = passwordSchema.refine(
  (password) => isHardToGuess(estimatePasswordStrength(password).score),
  WEAK_PASSWORD_MESSAGE,
);
