import { ID } from 'node-appwrite';
import { InputFile } from 'node-appwrite/file';

import { createAdminClient } from '@/lib/appwrite/admin';
import { APPWRITE_BUCKETS, getAppwriteConfig } from '@/lib/appwrite/config';

import { isOwnedStorageUrl, isOwnedStorageUrlInFolder } from './ownership';
import type { AllowedImageFolder, ImageStorageProvider } from './types';
import { parseAppwriteStorageUrl } from './urlValidation';

const FOLDER_BUCKETS: Record<AllowedImageFolder, string> = {
  categorias: APPWRITE_BUCKETS.categories,
  contenido: APPWRITE_BUCKETS.content,
  productos: APPWRITE_BUCKETS.products,
};

function folderToBucketId(folder: AllowedImageFolder): string {
  return FOLDER_BUCKETS[folder];
}

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
    } catch (error) {
      void error;
    }
  }

  async deleteMany(urls: string[]): Promise<void> {
    await Promise.allSettled(urls.filter(Boolean).map((url) => this.delete(url)));
  }

  isOwnedUrl(url: string): boolean {
    return isOwnedStorageUrl(url);
  }

  isOwnedUrlInFolder(url: string, folder: AllowedImageFolder): boolean {
    return isOwnedStorageUrlInFolder(url, folder);
  }
}

export const appwriteImageStorageProvider: ImageStorageProvider = new AppwriteImageStorageProvider();
