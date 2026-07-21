/**
 * Provider-agnostic image storage abstraction.
 *
 * The rest of the app (admin actions, schemas, upload route) depends only on
 * this interface — never on `node-appwrite` or any specific vendor. Swapping
 * storage providers means writing a new `ImageStorageProvider` implementation
 * and repointing `imageStorage` in `./index.ts`; nothing else changes.
 */

/** Closed list of folders images can be uploaded into. */
export type AllowedImageFolder = 'productos' | 'categorias';

export interface ImageStorageProvider {
  /** Uploads a file and returns its publicly reachable URL. */
  upload(input: {
    folder: AllowedImageFolder;
    buffer: Buffer;
    filename: string;
    mimeType: string;
  }): Promise<string>;

  /** Deletes a single image by its stored URL. Best-effort — never throws. */
  delete(url: string): Promise<void>;

  /** Deletes multiple images by URL. Best-effort — never throws. */
  deleteMany(urls: string[]): Promise<void>;

  /** True if `url` is served from this provider's own storage. */
  isOwnedUrl(url: string): boolean;
}

export const ALLOWED_IMAGE_FOLDERS: readonly AllowedImageFolder[] = ['productos', 'categorias'];

/** True if `value` is one of the allowed upload folders. */
export function isAllowedImageFolder(value: unknown): value is AllowedImageFolder {
  return typeof value === 'string' && (ALLOWED_IMAGE_FOLDERS as readonly string[]).includes(value);
}
