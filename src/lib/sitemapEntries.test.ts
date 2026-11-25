import { describe, expect, it } from 'vitest';

import { buildSitemapEntries } from './sitemapEntries';

const SITE_URL = 'https://www.example.com';

const categories = [{ slug: 'rosas' }, { slug: 'tulipanes' }, { slug: 'vacia' }];

const products = [
  { slug: 'ramo-rojo', categorySlug: 'rosas', updatedAt: '2026-03-01T10:00:00.000Z' },
  { slug: 'ramo-blanco', categorySlug: 'rosas', updatedAt: '2026-05-15T08:30:00.000Z' },
  { slug: 'tulipan-amarillo', categorySlug: 'tulipanes', updatedAt: '2026-04-02T12:00:00.000Z' },
  { slug: 'tulipan-sin-fecha', categorySlug: 'tulipanes', updatedAt: null },
];

function entryFor(path: string) {
  return buildSitemapEntries(SITE_URL, categories, products).find(
    (entry) => entry.url === `${SITE_URL}${path}`,
  );
}

describe('buildSitemapEntries', () => {
  it('omits the login and internal search pages', () => {
    const urls = buildSitemapEntries(SITE_URL, categories, products).map((entry) => entry.url);

    expect(urls.some((url) => url.includes('/login'))).toBe(false);
    expect(urls.some((url) => url.includes('/buscar'))).toBe(false);
  });

  it('lists the home, catalog, complaints book, categories and products', () => {
    const urls = buildSitemapEntries(SITE_URL, categories, products).map((entry) => entry.url);

    expect(urls).toEqual(
      expect.arrayContaining([
        `${SITE_URL}/`,
        `${SITE_URL}/catalogo`,
        `${SITE_URL}/libro-de-reclamaciones`,
        `${SITE_URL}/catalogo/rosas`,
        `${SITE_URL}/catalogo/tulipanes`,
        `${SITE_URL}/catalogo/rosas/ramo-rojo`,
        `${SITE_URL}/catalogo/tulipanes/tulipan-sin-fecha`,
      ]),
    );
  });

  it("dates each category with its newest product's updatedAt", () => {
    expect(entryFor('/catalogo/rosas')?.lastModified).toEqual(
      new Date('2026-05-15T08:30:00.000Z'),
    );
    expect(entryFor('/catalogo/tulipanes')?.lastModified).toEqual(
      new Date('2026-04-02T12:00:00.000Z'),
    );
  });

  it('omits lastModified for a category without dated products', () => {
    expect(entryFor('/catalogo/vacia')).not.toHaveProperty('lastModified');
  });

  it('dates the home and catalog with the newest product overall', () => {
    const newest = new Date('2026-05-15T08:30:00.000Z');

    expect(entryFor('/')?.lastModified).toEqual(newest);
    expect(entryFor('/catalogo')?.lastModified).toEqual(newest);
  });

  it('omits lastModified for the complaints book', () => {
    expect(entryFor('/libro-de-reclamaciones')).not.toHaveProperty('lastModified');
  });

  it('dates products with their own updatedAt and omits it when unknown', () => {
    expect(entryFor('/catalogo/rosas/ramo-rojo')?.lastModified).toEqual(
      new Date('2026-03-01T10:00:00.000Z'),
    );
    expect(entryFor('/catalogo/tulipanes/tulipan-sin-fecha')).not.toHaveProperty('lastModified');
  });

  it('omits every lastModified when no product is dated', () => {
    const entries = buildSitemapEntries(SITE_URL, categories, []);

    expect(entries.every((entry) => entry.lastModified === undefined)).toBe(true);
  });
});
