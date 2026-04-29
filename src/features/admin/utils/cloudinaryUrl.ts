import {
  ALLOWED_CLOUDINARY_FOLDERS,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_URL_REGEX,
} from '@/features/admin/schemas/common';

/**
 * Guard adicional (defense-in-depth) para chequear que una URL sea servida
 * desde nuestro Cloudinary. Reusa el mismo regex que `schemas/common.ts`.
 */
export function isAllowedCloudinaryUrl(url: unknown): url is string {
  if (typeof url !== 'string') return false;
  return CLOUDINARY_URL_REGEX.test(url);
}

/** Lista cerrada de folders válidos para uploads. */
export const ALLOWED_FOLDERS = ALLOWED_CLOUDINARY_FOLDERS;

/** Tipo unión (`'productos' | 'categorias'`) derivado del allowlist. */
export type AllowedCloudinaryFolder = (typeof ALLOWED_CLOUDINARY_FOLDERS)[number];

/** True si `value` es un folder permitido. */
export function isAllowedFolder(value: unknown): value is AllowedCloudinaryFolder {
  return (
    typeof value === 'string' &&
    (ALLOWED_CLOUDINARY_FOLDERS as readonly string[]).includes(value)
  );
}

/** Cloud name configurado (mantener sincronizado con `next.config.ts`). */
export const ALLOWED_CLOUD_NAME = CLOUDINARY_CLOUD_NAME;
