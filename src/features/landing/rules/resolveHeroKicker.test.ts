import { describe, expect, it } from 'vitest';

import { resolveHeroKicker } from './resolveHeroKicker';

const settings = { experience: '32' };

describe('resolveHeroKicker', () => {
  it('prefers the admin kicker when it has content', () => {
    expect(resolveHeroKicker('Flores con historia', settings)).toBe('Flores con historia');
  });

  it('trims the admin kicker', () => {
    expect(resolveHeroKicker('  Flores con historia  ', settings)).toBe('Flores con historia');
  });

  it('falls back to the positioning kicker when blank', () => {
    expect(resolveHeroKicker('   ', settings)).toBe('32 años en Barranco, Lima');
    expect(resolveHeroKicker('', settings)).toBe('32 años en Barranco, Lima');
  });

  it('falls back when the kicker is missing', () => {
    expect(resolveHeroKicker(undefined, settings)).toBe('32 años en Barranco, Lima');
  });
});
