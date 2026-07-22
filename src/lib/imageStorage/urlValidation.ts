import { APPWRITE_BUCKETS, getAppwriteConfig } from '@/lib/appwrite/config';

const VIEW_URL_PATTERN = /\/storage\/buckets\/([^/]+)\/files\/([^/]+)\/view/;

export function parseAppwriteStorageUrl(url: string): { bucketId: string; fileId: string } | null {
  const match = url.match(VIEW_URL_PATTERN);
  if (!match) return null;
  const [, bucketId, fileId] = match;
  return { bucketId, fileId };
}

export function isAppwriteStorageUrl(url: string): boolean {
  const parsed = parseAppwriteStorageUrl(url);
  if (!parsed) return false;

  const { endpoint, projectId } = getAppwriteConfig();
  let endpointHost: string;
  try {
    endpointHost = new URL(endpoint).host;
  } catch {
    return false;
  }

  let candidate: URL;
  try {
    candidate = new URL(url);
  } catch {
    return false;
  }

  if (candidate.host !== endpointHost) return false;
  if (candidate.searchParams.get('project') !== projectId) return false;

  const bucketIds: string[] = Object.values(APPWRITE_BUCKETS);
  return bucketIds.includes(parsed.bucketId);
}
