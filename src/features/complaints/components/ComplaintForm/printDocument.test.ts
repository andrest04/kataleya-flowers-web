import { describe, expect, it } from 'vitest';

import { printDocument } from './printDocument';

describe('printDocument', () => {
  it('wraps the copy in a complete Spanish document titled with the escaped sheet number', () => {
    const doc = printDocument('<div>Copia</div>', '00007-2026<b>');
    expect(doc.startsWith('<!doctype html><html lang="es">')).toBe(true);
    expect(doc).toContain('<meta charset="utf-8">');
    expect(doc).toContain('<title>Hoja de Reclamación 00007-2026&lt;b&gt;</title>');
    expect(doc).toContain('<body><div>Copia</div></body>');
  });

  it('denies every resource except inline styles', () => {
    expect(printDocument('', '1')).toContain(
      `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'">`,
    );
  });

  it('adds no script or print trigger of its own', () => {
    const doc = printDocument('<p>x</p>', '1');
    expect(doc).not.toMatch(/<script|onload|window\.print/i);
  });
});
