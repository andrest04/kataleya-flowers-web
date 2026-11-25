export function mergeUploadedUrls(
  current: readonly string[],
  uploaded: readonly (string | null)[],
): string[] {
  const merged = new Set(current);
  for (const url of uploaded) {
    if (url) merged.add(url);
  }
  return Array.from(merged);
}
