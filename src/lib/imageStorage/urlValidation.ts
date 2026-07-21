// Pure URL validation — no `node-appwrite` import. This file must stay safe
// to bundle client-side: `schemas/common.ts` is reachable from the public
// complaints form, so anything it imports (transitively) can end up in the
// browser bundle. Only `appwriteProvider.ts` (server-only) may import the SDK.
import { APPWRITE_BUCKETS, getAppwriteConfig } from '@/lib/appwrite/config';

/** Matches the view URL shape Appwrite Storage generates for uploaded files. */
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
