import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const deleteFile = vi.fn();
const createFile = vi.fn();

vi.mock('@/lib/appwrite/admin', () => ({
  createAdminClient: () => ({ storage: { deleteFile, createFile } }),
}));

vi.mock('@/lib/appwrite/config', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/appwrite/config')>()),
  getAppwriteConfig: () => ({
    endpoint: 'https://nyc.cloud.appwrite.io/v1',
    projectId: 'proj-test',
  }),
}));

const { appwriteImageStorageProvider } = await import('./appwriteProvider');

const CANONICAL = 'https://nyc.cloud.appwrite.io/v1/storage/buckets/product_images/files/file-1/view?project=proj-test';

beforeEach(() => {
  deleteFile.mockReset();
  createFile.mockReset();
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
  vi.spyOn(console, 'warn').mockImplementation(() => undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('AppwriteImageStorageProvider.delete', () => {
  it.each([
    ['a percent-encoded traversal', 'https://nyc.cloud.appwrite.io/v1/storage/buckets/product_images/files/..%2f..%2faccount/view?project=proj-test'],
    ['a backslash traversal', 'https://nyc.cloud.appwrite.io/v1/storage/buckets/product_images/files/a\\..\\..\\account/view?project=proj-test'],
    ['a query-string decoy', 'https://nyc.cloud.appwrite.io/v1/locale?x=/storage/buckets/product_images/files/a/view&project=proj-test'],
    ['a foreign host', CANONICAL.replace('nyc.cloud.appwrite.io', 'evil.example')],
    ['a foreign project', CANONICAL.replace('proj-test', 'other')],
  ])('never deletes for %s', async (_label, url) => {
    await expect(appwriteImageStorageProvider.delete(url)).resolves.toBe(false);
    expect(deleteFile).not.toHaveBeenCalled();
  });

  it('deletes an owned file with the parsed ids', async () => {
    deleteFile.mockResolvedValue({});
    await expect(appwriteImageStorageProvider.delete(CANONICAL)).resolves.toBe(true);
    expect(deleteFile).toHaveBeenCalledWith({ bucketId: 'product_images', fileId: 'file-1' });
  });

  it('returns false when Appwrite fails', async () => {
    deleteFile.mockRejectedValue(new Error('boom'));
    await expect(appwriteImageStorageProvider.delete(CANONICAL)).resolves.toBe(false);
  });
});

describe('AppwriteImageStorageProvider.deleteMany', () => {
  it('reports success when every owned file is deleted and skips unowned URLs', async () => {
    deleteFile.mockResolvedValue({});
    await expect(
      appwriteImageStorageProvider.deleteMany([CANONICAL, '/images/hero/rosas.jpg', '']),
    ).resolves.toBe(true);
    expect(deleteFile).toHaveBeenCalledTimes(1);
  });

  it('reports failure when an owned file cannot be deleted', async () => {
    deleteFile.mockResolvedValueOnce({}).mockRejectedValueOnce(new Error('boom'));
    await expect(
      appwriteImageStorageProvider.deleteMany([CANONICAL, CANONICAL.replace('file-1', 'file-2')]),
    ).resolves.toBe(false);
  });
});

describe('AppwriteImageStorageProvider.upload', () => {
  it('names the file after a fresh id and the validated extension and returns the canonical URL', async () => {
    createFile.mockResolvedValue({ $id: 'new-file' });
    const url = await appwriteImageStorageProvider.upload({
      folder: 'productos',
      buffer: Buffer.from('png'),
      filename: '../../evil.html',
      mimeType: 'image/png',
    });

    expect(url).toBe('https://nyc.cloud.appwrite.io/v1/storage/buckets/product_images/files/new-file/view?project=proj-test');
    const [{ bucketId, file }] = createFile.mock.calls[0] as [{ bucketId: string; file: { filename: string } }];
    expect(bucketId).toBe('product_images');
    expect(file.filename).toMatch(/^[A-Za-z0-9]+\.png$/);
  });
});
