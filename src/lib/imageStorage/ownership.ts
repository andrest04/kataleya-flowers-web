import { APPWRITE_BUCKETS, getAppwriteConfig } from '@/lib/appwrite/config';

import type { AllowedImageFolder } from './types';
import { parseAppwriteStorageUrl } from './urlValidation';

const FOLDER_BUCKETS: Record<AllowedImageFolder, string> = {
  categorias: APPWRITE_BUCKETS.categories,
  contenido: APPWRITE_BUCKETS.content,
  productos: APPWRITE_BUCKETS.products,
};

function matchesOwnedStorage(url: string): { bucketId: string; fileId: string } | null {
  const parsed = parseAppwriteStorageUrl(url);
  if (!parsed) return null;

  const { endpoint, projectId } = getAppwriteConfig();
  let endpointHost: string;
  try {
    endpointHost = new URL(endpoint).host;
  } catch {
    return null;
  }

  let candidate: URL;
  try {
    candidate = new URL(url);
  } catch {
    return null;
  }

  if (candidate.host !== endpointHost) return null;
  if (candidate.searchParams.get('project') !== projectId) return null;

  const bucketIds: string[] = Object.values(APPWRITE_BUCKETS);
  if (!bucketIds.includes(parsed.bucketId)) return null;

  return parsed;
}

export function isOwnedStorageUrl(url: string): boolean {
  return matchesOwnedStorage(url) !== null;
}

export function isOwnedStorageUrlInFolder(url: string, folder: AllowedImageFolder): boolean {
  const parsed = matchesOwnedStorage(url);
  return parsed?.bucketId === FOLDER_BUCKETS[folder];
}
