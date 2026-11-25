import { parseStorageViewPath } from '@/lib/imageStorage/urlValidation';

const DEFAULT_QUALITY = 80;
const LOCAL_ASSET_SRC = /^\/(?![/\\])[^?#\\]*$/;

interface StoredImageLoaderParams {
  src: string;
  width: number;
  quality?: number;
}

export function isStoredImageSrc(src: string): boolean {
  return parseStorageViewPath(src) !== null;
}

export function isLocalAssetSrc(src: string): boolean {
  return LOCAL_ASSET_SRC.test(src);
}

export default function storedImageLoader({ src, width, quality }: StoredImageLoaderParams): string {
  if (!isStoredImageSrc(src)) return src;

  const url = new URL(src);
  url.pathname = url.pathname.replace(/\/view$/, '/preview');
  url.searchParams.set('width', String(width));
  url.searchParams.set('quality', String(quality ?? DEFAULT_QUALITY));
  url.searchParams.set('output', 'webp');
  return url.toString();
}
