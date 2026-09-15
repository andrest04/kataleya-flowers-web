const VIEW_URL_PATTERN = /\/storage\/buckets\/([^/]+)\/files\/([^/]+)\/view/;

export function parseAppwriteStorageUrl(url: string): { bucketId: string; fileId: string } | null {
  const match = url.match(VIEW_URL_PATTERN);
  if (!match) return null;
  const [, bucketId, fileId] = match;
  return { bucketId, fileId };
}
