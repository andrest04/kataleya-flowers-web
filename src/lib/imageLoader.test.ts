import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import storedImageLoader, { isLocalAssetSrc, isStoredImageSrc } from './imageLoader';

const CANONICAL = 'https://nyc.cloud.appwrite.io/v1/storage/buckets/product_images/files/file-1/view?project=proj-test';

beforeEach(() => {
  vi.stubEnv('APPWRITE_ENDPOINT', '');
  vi.stubEnv('APPWRITE_PROJECT_ID', '');
  vi.stubEnv('APPWRITE_API_KEY', '');
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('storedImageLoader', () => {
  it('rewrites a canonical view URL to a sized preview', () => {
    const result = new URL(storedImageLoader({ src: CANONICAL, width: 640, quality: 70 }));
    expect(result.origin).toBe('https://nyc.cloud.appwrite.io');
    expect(result.pathname).toBe('/v1/storage/buckets/product_images/files/file-1/preview');
    expect(result.searchParams.get('project')).toBe('proj-test');
    expect(result.searchParams.get('width')).toBe('640');
    expect(result.searchParams.get('quality')).toBe('70');
    expect(result.searchParams.get('output')).toBe('webp');
  });

  it('uses the default quality when none is given', () => {
    const result = new URL(storedImageLoader({ src: CANONICAL, width: 320 }));
    expect(result.searchParams.get('quality')).toBe('80');
  });

  it('replaces only the final view segment', () => {
    const src = 'https://nyc.cloud.appwrite.io/view/storage/buckets/product_images/files/file-1/view?project=proj-test';
    const result = new URL(storedImageLoader({ src, width: 100 }));
    expect(result.pathname).toBe('/view/storage/buckets/product_images/files/file-1/preview');
  });

  it('passes a storage pattern hidden in the query string through unchanged', () => {
    const src = 'https://nyc.cloud.appwrite.io/v1/locale?x=/storage/buckets/product_images/files/a/view&project=p';
    expect(storedImageLoader({ src, width: 640 })).toBe(src);
  });

  it('passes local images through unchanged', () => {
    expect(storedImageLoader({ src: '/images/hero/rosas.jpg', width: 640 })).toBe('/images/hero/rosas.jpg');
  });
});

describe('isStoredImageSrc', () => {
  it('accepts a canonical storage view URL', () => {
    expect(isStoredImageSrc(CANONICAL)).toBe(true);
  });

  it.each([
    ['/libro-reclamaciones-indecopi.png'],
    ['/images/hero/rosas.jpg'],
    ['https://nyc.cloud.appwrite.io/v1/locale?x=/storage/buckets/product_images/files/a/view&project=p'],
  ])('rejects %s', (src) => {
    expect(isStoredImageSrc(src)).toBe(false);
  });
});

describe('isLocalAssetSrc', () => {
  it.each([
    ['/libro-reclamaciones-indecopi.png'],
    ['/images/hero/rosas.jpg'],
  ])('accepts the public asset %s', (src) => {
    expect(isLocalAssetSrc(src)).toBe(true);
  });

  it.each([
    [CANONICAL],
    ['//cdn.example.com/a.png'],
    ['/api/images/source?url=x'],
    ['/a.png#frag'],
    ['blob:http://localhost/123'],
    ['data:image/png;base64,AAAA'],
    ['https://example.com/a.png'],
  ])('rejects %s', (src) => {
    expect(isLocalAssetSrc(src)).toBe(false);
  });
});
