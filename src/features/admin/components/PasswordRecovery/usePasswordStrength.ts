import { useEffect, useMemo, useState } from 'react';

import type { PasswordStrengthEstimate } from '@/features/admin/schemas/passwordStrength';

type Estimator = (password: string) => PasswordStrengthEstimate;

export type PasswordStrengthState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'unavailable' }
  | { status: 'ready'; estimate: PasswordStrengthEstimate };

export function usePasswordStrength(password: string): PasswordStrengthState {
  const [estimator, setEstimator] = useState<{ estimate: Estimator } | null>(null);
  const [failed, setFailed] = useState(false);
  const hasPassword = password !== '';

  useEffect(() => {
    if (!hasPassword || estimator || failed) return;
    import('@/features/admin/schemas/passwordStrength')
      .then((module) => setEstimator({ estimate: module.estimatePasswordStrength }))
      .catch(() => setFailed(true));
  }, [hasPassword, estimator, failed]);

  const estimate = useMemo(
    () => (estimator && hasPassword ? estimator.estimate(password) : null),
    [estimator, hasPassword, password],
  );

  if (!hasPassword) return { status: 'idle' };
  if (failed) return { status: 'unavailable' };
  if (!estimate) return { status: 'loading' };
  return { status: 'ready', estimate };
}
