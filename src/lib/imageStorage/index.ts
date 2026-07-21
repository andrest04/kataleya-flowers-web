import { appwriteImageStorageProvider } from './appwriteProvider';
import type { ImageStorageProvider } from './types';

/**
 * Single entry point the rest of the app imports. Everything outside this
 * folder depends on `ImageStorageProvider`, never on Appwrite directly —
 * swapping providers means changing this one line.
 */
export const imageStorage: ImageStorageProvider = appwriteImageStorageProvider;

export type { AllowedImageFolder, ImageStorageProvider } from './types';
export { ALLOWED_IMAGE_FOLDERS, isAllowedImageFolder } from './types';
