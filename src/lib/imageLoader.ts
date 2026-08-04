const APPWRITE_STORAGE_VIEW_PATTERN = /\/storage\/buckets\/[^/]+\/files\/[^/]+\/view/;
const DEFAULT_QUALITY = 80;

interface AppwriteImageLoaderParams {
  src: string;
  width: number;
  quality?: number;
}

export default function appwriteImageLoader({ src, width, quality }: AppwriteImageLoaderParams): string {
  if (!APPWRITE_STORAGE_VIEW_PATTERN.test(src)) return src;

  const url = new URL(src);
  url.pathname = url.pathname.replace('/view', '/preview');
  url.searchParams.set('width', String(width));
  url.searchParams.set('quality', String(quality ?? DEFAULT_QUALITY));
  url.searchParams.set('output', 'webp');
  return url.toString();
}
