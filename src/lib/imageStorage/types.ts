export type AllowedImageFolder = 'productos' | 'categorias';

export interface ImageStorageProvider {
  upload(input: {
    folder: AllowedImageFolder;
    buffer: Buffer;
    filename: string;
    mimeType: string;
  }): Promise<string>;

  delete(url: string): Promise<void>;

  deleteMany(urls: string[]): Promise<void>;

  isOwnedUrl(url: string): boolean;
}

export const ALLOWED_IMAGE_FOLDERS: readonly AllowedImageFolder[] = ['productos', 'categorias'];

export function isAllowedImageFolder(value: unknown): value is AllowedImageFolder {
  return typeof value === 'string' && (ALLOWED_IMAGE_FOLDERS as readonly string[]).includes(value);
}
