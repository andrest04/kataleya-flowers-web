import { describe, expect, it } from 'vitest';

import { serializeJsonLd } from './jsonLd';

describe('serializeJsonLd', () => {
  const data = {
    name: '</script><script>alert(1)</script>',
    description: 'Rosas & tulipanes > orquídeas',
    separators: 'a\u2028b\u2029c',
  };

  it('escapes characters that can break out of a script element', () => {
    const json = serializeJsonLd(data);
    expect(json).not.toMatch(/[<>&\u2028\u2029]/);
    expect(json).toContain('\\u003c/script\\u003e');
    expect(json).toContain('\\u0026');
    expect(json).toContain('\\u2028');
    expect(json).toContain('\\u2029');
  });

  it('round-trips through JSON.parse', () => {
    expect(JSON.parse(serializeJsonLd(data))).toEqual(data);
    const list = [{ '@type': 'ListItem', position: 1 }];
    expect(JSON.parse(serializeJsonLd(list))).toEqual(list);
  });
});
