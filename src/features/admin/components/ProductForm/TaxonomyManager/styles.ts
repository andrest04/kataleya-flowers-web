import type { CSSProperties } from 'react';

import type { ActiveColor } from './types';

export const PILL_BASE: CSSProperties = {
  borderColor: 'var(--color-border)',
  color: 'var(--color-dark)',
  background: 'var(--color-surface)',
};

export const RENAME_INPUT_WIDTH = '130px';
export const ADD_INPUT_WIDTH = '150px';

export function getPillSelectedBg(activeColor: ActiveColor): string {
  return activeColor === 'primary'
    ? 'color-mix(in srgb, var(--color-primary) 12%, var(--color-white))'
    : 'color-mix(in srgb, var(--color-accent) 12%, var(--color-white))';
}

export function getActiveColorVar(activeColor: ActiveColor): string {
  return activeColor === 'primary'
    ? 'var(--color-primary)'
    : 'var(--color-accent)';
}
