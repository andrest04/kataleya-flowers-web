import { describe, expect, it } from 'vitest';

import { truncateOnWord } from './seoText';

describe('truncateOnWord', () => {
  it('returns text under the limit unchanged', () => {
    expect(truncateOnWord('Rosas rojas para regalar', 160)).toBe('Rosas rojas para regalar');
  });

  it('returns text exactly at the limit unchanged', () => {
    const text = 'a'.repeat(160);
    expect(truncateOnWord(text, 160)).toBe(text);
  });

  it('cuts at the last word boundary and appends an ellipsis', () => {
    const text = 'Arreglo floral con rosas rojas y lirios blancos';
    const result = truncateOnWord(text, 30);
    expect(result).toBe('Arreglo floral con rosas…');
    expect(result.length).toBeLessThanOrEqual(30);
  });

  it('never ends a cut in the middle of a word', () => {
    const text = 'Ramo de girasoles frescos entregado a domicilio en toda la ciudad de Lima con tarjeta dedicada';
    const result = truncateOnWord(text, 40);
    const kept = result.slice(0, -1);
    expect(result.endsWith('…')).toBe(true);
    expect(text.startsWith(kept)).toBe(true);
    expect(text.charAt(kept.length)).toBe(' ');
  });

  it('drops trailing punctuation before the ellipsis', () => {
    expect(truncateOnWord('Rosas, lirios, girasoles y orquídeas', 22)).toBe('Rosas, lirios…');
  });

  it('collapses whitespace and line breaks', () => {
    expect(truncateOnWord('Rosas\n\n  rojas\tfrescas', 160)).toBe('Rosas rojas frescas');
  });

  it('hard-cuts a single long word that has no boundary', () => {
    const result = truncateOnWord('a'.repeat(50), 10);
    expect(result).toBe(`${'a'.repeat(9)}…`);
  });
});
