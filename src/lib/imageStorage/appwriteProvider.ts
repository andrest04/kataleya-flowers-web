import { ID } from 'node-appwrite';
import { InputFile } from 'node-appwrite/file';

import { createAdminClient } from '@/lib/appwrite/admin';

import {
  bucketIdForFolder,
  buildStorageViewUrl,
  isOwnedStorageUrl,
  isOwnedStorageUrlInFolder,
  parseOwnedStorageUrl,
} from './ownership';
import type { AllowedImageFolder, ImageStorageProvider } from './types';

const EXTENSION_BY_MIME: Record<string, string> = {
  'image/avif': 'avif',
  'image/gif': 'gif',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

function extensionFromMime(mimeType: string): string {
  const extension = EXTENSION_BY_MIME[mimeType.toLowerCase()];
  if (!extension) throw new Error(`Unsupported image MIME type: ${mimeType}`);
  return extension;
}

function errorMessage(error: unknown): unknown {
  return error instanceof Error ? error.message : error;
}

class AppwriteImageStorageProvider implements ImageStorageProvider {
  async upload(input: {
    folder: AllowedImageFolder;
    buffer: Buffer;
    filename: string;
    mimeType: string;
  }): Promise<string> {
    const { storage } = createAdminClient();
    const bucketId = bucketIdForFolder(input.folder);
    const storedName = `${ID.unique()}.${extensionFromMime(input.mimeType)}`;

    const file = await storage.createFile({
      bucketId,
      fileId: ID.unique(),
      file: InputFile.fromBuffer(input.buffer, storedName),
    });

    return buildStorageViewUrl(bucketId, file.$id);
  }

  async delete(url: string): Promise<boolean> {
    const owned = parseOwnedStorageUrl(url);
    if (!owned) {
      console.error('[imageStorage] delete rechazado: la URL no pertenece al storage propio');
      return false;
    }

    try {
      const { storage } = createAdminClient();
      await storage.deleteFile({
        bucketId: encodeURIComponent(owned.bucketId),
        fileId: encodeURIComponent(owned.fileId),
      });
      return true;
    } catch (error) {
      console.error('[imageStorage] delete falló', {
        bucketId: owned.bucketId,
        fileId: owned.fileId,
        error: errorMessage(error),
      });
      return false;
    }
  }

  async deleteMany(urls: string[]): Promise<boolean> {
    const owned = urls.filter((url) => url && isOwnedStorageUrl(url));
    const results = await Promise.all(owned.map((url) => this.delete(url)));
    return results.every(Boolean);
  }

  isOwnedUrl(url: string): boolean {
    return isOwnedStorageUrl(url);
  }

  isOwnedUrlInFolder(url: string, folder: AllowedImageFolder): boolean {
    return isOwnedStorageUrlInFolder(url, folder);
  }
}

export const appwriteImageStorageProvider: ImageStorageProvider = new AppwriteImageStorageProvider();
