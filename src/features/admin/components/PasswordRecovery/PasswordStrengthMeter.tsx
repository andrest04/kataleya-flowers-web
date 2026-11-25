import { Progress } from 'radix-ui';

import type { PasswordStrengthScore } from '@/features/admin/schemas/passwordPolicy';
import { passwordStrengthLabel } from '@/features/admin/schemas/passwordPolicy';

import type { PasswordStrengthState } from './usePasswordStrength';

const MAX_VALUE = 5;

const SCORE_COLORS: Record<PasswordStrengthScore, string> = {
  0: 'var(--color-primary)',
  1: 'var(--color-primary)',
  2: 'var(--color-gold-text)',
  3: 'var(--color-accent)',
  4: 'var(--color-accent)',
};

interface PasswordStrengthMeterProps {
  id: string;
  strength: PasswordStrengthState;
}

export default function PasswordStrengthMeter({ id, strength }: PasswordStrengthMeterProps) {
  if (strength.status === 'unavailable') return null;

  const estimate = strength.status === 'ready' ? strength.estimate : null;
  const value = estimate ? estimate.score + 1 : strength.status === 'idle' ? 0 : null;
  const label = estimate ? passwordStrengthLabel(estimate.score) : null;
  const color = estimate ? SCORE_COLORS[estimate.score] : 'var(--color-border)';
  const percent = ((value ?? 0) / MAX_VALUE) * 100;

  return (
    <div className="mt-2">
      <Progress.Root
        value={value}
        max={MAX_VALUE}
        aria-label="Seguridad de la contraseña"
        getValueLabel={() => label ?? ''}
        className="relative h-1.5 w-full overflow-hidden rounded-full"
        style={{ background: 'var(--color-border)' }}
      >
        <Progress.Indicator
          className="h-full w-full rounded-full transition-transform duration-300 ease-out motion-reduce:transition-none"
          style={{ background: color, transform: `translateX(-${100 - percent}%)` }}
        />
      </Progress.Root>
      <div id={id} className="mt-1 min-h-4 space-y-0.5 text-xs">
        {strength.status === 'loading' && <p style={{ color: 'var(--color-muted)' }}>Calculando seguridad…</p>}
        {label && (
          <p style={{ color: 'var(--color-dark)' }}>
            Seguridad: <span className="font-medium" style={{ color }}>{label}</span>
          </p>
        )}
        {estimate?.warning && <p style={{ color: 'var(--color-muted)' }}>{estimate.warning}</p>}
      </div>
    </div>
  );
}
