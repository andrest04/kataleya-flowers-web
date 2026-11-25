import { evaluatePasswordCriteria, isHardToGuess } from '@/features/admin/schemas/passwordPolicy';

import { usePasswordStrength } from './usePasswordStrength';

export function usePasswordRequirements(password: string, confirmPassword: string) {
  const { criteria, meetsCriteria } = evaluatePasswordCriteria(password);
  const strength = usePasswordStrength(password);
  const hardToGuess =
    strength.status === 'unavailable'
      ? null
      : strength.status === 'ready' && isHardToGuess(strength.estimate.score);
  const passwordsMatch = confirmPassword !== '' && password === confirmPassword;
  const canSubmit = meetsCriteria && passwordsMatch && hardToGuess !== false;

  return { criteria, strength, hardToGuess, passwordsMatch, canSubmit };
}
