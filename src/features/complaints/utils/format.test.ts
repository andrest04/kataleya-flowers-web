import { describe, expect, it } from 'vitest';

import { formatComplaintNumber, limaYear } from './format';

describe('limaYear', () => {
  it('returns the Lima calendar year when UTC has already rolled over', () => {
    expect(limaYear('2027-01-01T04:30:00Z')).toBe(2026);
  });

  it('returns the new year once Lima reaches midnight', () => {
    expect(limaYear('2027-01-01T05:00:00Z')).toBe(2027);
  });

  it('accepts Date instances', () => {
    expect(limaYear(new Date('2026-06-15T12:00:00Z'))).toBe(2026);
  });
});

describe('formatComplaintNumber', () => {
  it('prefers the stored year over the createdAt year', () => {
    expect(formatComplaintNumber(7, { year: 2026, createdAt: '2027-01-01T05:10:00Z' })).toBe(
      '00007-2026',
    );
  });

  it('uses the UTC year of createdAt for legacy rows without a stored year', () => {
    expect(formatComplaintNumber(3, { year: null, createdAt: '2026-01-01T02:00:00Z' })).toBe(
      '00003-2026',
    );
    expect(formatComplaintNumber(12, { year: null, createdAt: '2025-12-31T23:59:59Z' })).toBe(
      '00012-2025',
    );
  });

  it('pads the correlativo to five digits', () => {
    expect(formatComplaintNumber(123456, { year: 2026, createdAt: '2026-03-01T00:00:00Z' })).toBe(
      '123456-2026',
    );
  });
});
