import type { CSSProperties } from 'react';

import type { ActiveColor } from './types';

/** Estilo base compartido entre todas las pills (border, color, fondo). */
export const PILL_BASE: CSSProperties = {
  borderColor: 'var(--color-border)',
  color: 'var(--color-dark)',
  background: 'var(--color-surface)',
};

/** Anchos de los inputs inline (rename y add). */
export const RENAME_INPUT_WIDTH = '130px';
export const ADD_INPUT_WIDTH = '150px';

/** Fondo de pill seleccionada: 12% del color activo mezclado con blanco. */
export function getPillSelectedBg(activeColor: ActiveColor): string {
  return activeColor === 'primary'
    ? 'color-mix(in srgb, var(--color-primary) 12%, var(--color-white))'
    : 'color-mix(in srgb, var(--color-accent) 12%, var(--color-white))';
}

/** CSS var del color activo (para borders / texto en botones de "Agregar"). */
export function getActiveColorVar(activeColor: ActiveColor): string {
  return activeColor === 'primary'
    ? 'var(--color-primary)'
    : 'var(--color-accent)';
}
