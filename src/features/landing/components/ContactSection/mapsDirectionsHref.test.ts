import { describe, expect, it } from 'vitest';

import { mapsDirectionsHref } from './mapsDirectionsHref';

describe('mapsDirectionsHref', () => {
  it('encodes the address as the destination of a directions link', () => {
    expect(mapsDirectionsHref('Teodosio Parreño 115, Lima')).toBe(
      'https://www.google.com/maps/dir/?api=1&destination=Teodosio%20Parre%C3%B1o%20115%2C%20Lima',
    );
  });
});
