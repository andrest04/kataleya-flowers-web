import { APPWRITE_BUCKETS } from '@/lib/appwrite/ids';

export interface StorageViewPath {
  host: string;
  endpointPath: string;
  bucketId: string;
  fileId: string;
  projectParams: string[];
  paramCount: number;
}

const UNSAFE_RAW_CHARACTER = /[\\%#]/;
const DOT_SEGMENT = /\/\.{1,2}(?=[/?]|$)/;
const VIEW_PATH = /^((?:\/[A-Za-z0-9._-]+)*)\/storage\/buckets\/([A-Za-z0-9._-]+)\/files\/([A-Za-z0-9][A-Za-z0-9._-]{0,35})\/view$/;
const BUCKET_IDS: readonly string[] = Object.values(APPWRITE_BUCKETS);

function hasControlOrSpace(value: string): boolean {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code <= 0x20 || code === 0x7f) return true;
  }
  return false;
}

export function parseStorageViewPath(url: string): StorageViewPath | null {
  if (UNSAFE_RAW_CHARACTER.test(url) || DOT_SEGMENT.test(url) || hasControlOrSpace(url)) return null;

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  if (parsed.protocol !== 'https:' || parsed.username || parsed.password || parsed.hash) return null;

  const match = VIEW_PATH.exec(parsed.pathname);
  if (!match) return null;
  const [, endpointPath, bucketId, fileId] = match;
  if (!BUCKET_IDS.includes(bucketId)) return null;

  return {
    host: parsed.host,
    endpointPath,
    bucketId,
    fileId,
    projectParams: parsed.searchParams.getAll('project'),
    paramCount: [...parsed.searchParams.keys()].length,
  };
}
