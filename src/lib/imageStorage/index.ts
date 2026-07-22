import { appwriteImageStorageProvider } from './appwriteProvider';
import type { ImageStorageProvider } from './types';

export const imageStorage: ImageStorageProvider = appwriteImageStorageProvider;

export type { AllowedImageFolder, ImageStorageProvider } from './types';
export { ALLOWED_IMAGE_FOLDERS, isAllowedImageFolder } from './types';
