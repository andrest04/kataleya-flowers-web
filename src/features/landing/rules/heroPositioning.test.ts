import { describe, expect, it } from 'vitest';

import { heroPositioningKicker, STORE_LOCALITY } from './heroPositioning';

describe('heroPositioningKicker', () => {
  it('states the years of experience and the Barranco location', () => {
    expect(heroPositioningKicker({ experience: '32' })).toBe('32 años en Barranco, Lima');
  });

  it('follows the configured experience', () => {
    expect(heroPositioningKicker({ experience: '35' })).toBe('35 años en Barranco, Lima');
  });

  it('ends with the shared store locality', () => {
    expect(heroPositioningKicker({ experience: '32' }).endsWith(STORE_LOCALITY)).toBe(true);
    expect(STORE_LOCALITY).toBe('Barranco, Lima');
  });
});
