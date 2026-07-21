// Server-only: this module goes through `createAdminClient()`, which holds the
// Appwrite API key. Never import it into client code.
import { ID } from 'node-appwrite';
import { InputFile } from 'node-appwrite/file';

import { createAdminClient } from '@/lib/appwrite/admin';
import { APPWRITE_BUCKETS, getAppwriteConfig } from '@/lib/appwrite/config';

import type { AllowedImageFolder, ImageStorageProvider } from './types';
import { isAppwriteStorageUrl, parseAppwriteStorageUrl } from './urlValidation';

function folderToBucketId(folder: AllowedImageFolder): string {
  return folder === 'productos' ? APPWRITE_BUCKETS.products : APPWRITE_BUCKETS.categories;
}

/**
 * `ImageStorageProvider` backed by Appwrite Storage. Talks to `node-appwrite`
 * directly — this is the only file in `lib/imageStorage` allowed to do so.
 */
class AppwriteImageStorageProvider implements ImageStorageProvider {
  async upload(input: {
    folder: AllowedImageFolder;
    buffer: Buffer;
    filename: string;
    mimeType: string;
  }): Promise<string> {
    const { storage } = createAdminClient();
    const { endpoint, projectId } = getAppwriteConfig();
    const bucketId = folderToBucketId(input.folder);

    const file = await storage.createFile({
      bucketId,
      fileId: ID.unique(),
      file: InputFile.fromBuffer(input.buffer, input.filename),
    });

    return `${endpoint}/storage/buckets/${bucketId}/files/${file.$id}/view?project=${projectId}`;
  }

  async delete(url: string): Promise<void> {
    const parsed = parseAppwriteStorageUrl(url);
    if (!parsed) return;

    try {
      const { storage } = createAdminClient();
      await storage.deleteFile({ bucketId: parsed.bucketId, fileId: parsed.fileId });
    } catch {
      // Best-effort — deleting from storage should never block DB operations.
    }
  }

  async deleteMany(urls: string[]): Promise<void> {
    await Promise.allSettled(urls.filter(Boolean).map((url) => this.delete(url)));
  }

  isOwnedUrl(url: string): boolean {
    return isAppwriteStorageUrl(url);
  }
}

export const appwriteImageStorageProvider: ImageStorageProvider = new AppwriteImageStorageProvider();
