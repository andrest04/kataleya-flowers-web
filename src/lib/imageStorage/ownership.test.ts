import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/appwrite/config', () => ({
  APPWRITE_BUCKETS: {
    products: 'product_images',
    categories: 'category_images',
    content: 'content_images',
  },
  getAppwriteConfig: () => ({
    endpoint: 'https://nyc.cloud.appwrite.io/v1',
    projectId: 'proj-test',
  }),
}));

const { isOwnedStorageUrl, isOwnedStorageUrlInFolder } = await import('./ownership');

function storageUrl(
  bucketId: string,
  options?: { host?: string; project?: string; fileId?: string },
): string {
  const host = options?.host ?? 'nyc.cloud.appwrite.io';
  const project = options?.project ?? 'proj-test';
  const fileId = options?.fileId ?? 'file-1';
  return `https://${host}/v1/storage/buckets/${bucketId}/files/${fileId}/view?project=${project}`;
}

describe('isOwnedStorageUrl', () => {
  it('accepts a view URL on the configured host, project, and bucket', () => {
    expect(isOwnedStorageUrl(storageUrl('content_images'))).toBe(true);
    expect(isOwnedStorageUrl(storageUrl('product_images'))).toBe(true);
    expect(isOwnedStorageUrl(storageUrl('category_images'))).toBe(true);
  });

  it('rejects a URL on the wrong host', () => {
    expect(isOwnedStorageUrl(storageUrl('content_images', { host: 'fra.cloud.appwrite.io' }))).toBe(
      false,
    );
  });

  it('rejects a URL whose bucket is not owned', () => {
    expect(isOwnedStorageUrl(storageUrl('other_images'))).toBe(false);
  });

  it('rejects a URL with the wrong project', () => {
    expect(isOwnedStorageUrl(storageUrl('content_images', { project: 'other-project' }))).toBe(
      false,
    );
  });

  it('rejects a non-storage or invalid URL', () => {
    expect(isOwnedStorageUrl('https://nyc.cloud.appwrite.io/v1/not-storage')).toBe(false);
    expect(isOwnedStorageUrl('not-a-url')).toBe(false);
  });
});

describe('isOwnedStorageUrlInFolder', () => {
  it('matches when the URL belongs to the folder bucket', () => {
    expect(isOwnedStorageUrlInFolder(storageUrl('content_images'), 'contenido')).toBe(true);
    expect(isOwnedStorageUrlInFolder(storageUrl('product_images'), 'productos')).toBe(true);
    expect(isOwnedStorageUrlInFolder(storageUrl('category_images'), 'categorias')).toBe(true);
  });

  it('rejects an owned URL that belongs to a different folder', () => {
    expect(isOwnedStorageUrlInFolder(storageUrl('product_images'), 'contenido')).toBe(false);
    expect(isOwnedStorageUrlInFolder(storageUrl('content_images'), 'productos')).toBe(false);
  });

  it('rejects a URL that is not owned even if the path names the folder bucket', () => {
    expect(
      isOwnedStorageUrlInFolder(
        storageUrl('content_images', { host: 'fra.cloud.appwrite.io' }),
        'contenido',
      ),
    ).toBe(false);
  });
});
