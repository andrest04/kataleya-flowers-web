import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/appwrite/config', () => ({
  getAppwriteConfig: () => ({
    endpoint: 'https://nyc.cloud.appwrite.io/v1',
    projectId: 'proj-test',
  }),
}));

const { discoverTileSchema, isPublicSiteImagePath } = await import('./discoverTile');

function tile(overrides: { href?: string; imageUrl?: string } = {}) {
  return {
    description: 'Arreglos para cada ocasión',
    href: overrides.href ?? '/catalogo',
    icon: 'gift',
    imageUrl: overrides.imageUrl ?? '/images/hero/rosas.jpg',
    isActive: true,
    isExternal: false,
    title: 'Regalos',
  };
}

function issuesAt(field: 'href' | 'imageUrl', overrides: { href?: string; imageUrl?: string }) {
  const result = discoverTileSchema.safeParse(tile(overrides));
  if (result.success) return [];
  return result.error.issues.filter((issue) => issue.path[0] === field);
}

describe('isPublicSiteImagePath', () => {
  it('accepts files under /images', () => {
    expect(isPublicSiteImagePath('/images/hero/rosas.jpg')).toBe(true);
    expect(isPublicSiteImagePath('/images/discover/tile_1-a.webp')).toBe(true);
  });

  it.each([
    ['/\\evil.com/x'],
    ['/images/\\evil.com/x'],
    ['//evil.com/images/x.jpg'],
    ['/images/../secret.jpg'],
    ['/images/..'],
    ['/images/a\tb.jpg'],
    ['/images/a\u0000b.jpg'],
    ['/images/a b.jpg'],
    ['/images/'],
    ['/logo.png'],
    ['https://evil.com/images/x.jpg'],
  ])('rejects %j', (value) => {
    expect(isPublicSiteImagePath(value)).toBe(false);
  });
});

describe('discoverTileSchema', () => {
  it('accepts a site path, a fragment and an https href', () => {
    expect(issuesAt('href', { href: '/catalogo/cumpleanos' })).toEqual([]);
    expect(issuesAt('href', { href: '#contacto' })).toEqual([]);
    expect(issuesAt('href', { href: 'https://www.instagram.com/kataleya' })).toEqual([]);
  });

  it.each([
    ['javascript:alert(1)'],
    ['data:text/html,<script>alert(1)</script>'],
    ['vbscript:msgbox(1)'],
    ['//evil.com'],
    ['/\\evil.com/x'],
  ])('rejects the unsafe href %s', (href) => {
    expect(issuesAt('href', { href })).toHaveLength(1);
  });

  it('rejects a backslash image path', () => {
    expect(issuesAt('imageUrl', { imageUrl: '/\\evil.com/x' })).toHaveLength(1);
  });
});
