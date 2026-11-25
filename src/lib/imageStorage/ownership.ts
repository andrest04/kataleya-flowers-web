import { getAppwriteConfig } from '@/lib/appwrite/config';
import { APPWRITE_BUCKETS } from '@/lib/appwrite/ids';

import type { AllowedImageFolder } from './types';
import { parseStorageViewPath } from './urlValidation';

export interface OwnedStorageFile {
  bucketId: string;
  fileId: string;
  canonicalUrl: string;
}

const FOLDER_BUCKETS: Record<AllowedImageFolder, string> = {
  categorias: APPWRITE_BUCKETS.categories,
  contenido: APPWRITE_BUCKETS.content,
  productos: APPWRITE_BUCKETS.products,
};

interface StorageEndpoint {
  origin: string;
  host: string;
  path: string;
  projectId: string;
}

function resolveStorageEndpoint(): StorageEndpoint | null {
  const { endpoint, projectId } = getAppwriteConfig();
  let parsed: URL;
  try {
    parsed = new URL(endpoint);
  } catch {
    return null;
  }
  if (parsed.protocol !== 'https:') return null;
  return {
    origin: parsed.origin,
    host: parsed.host,
    path: parsed.pathname.replace(/\/+$/, ''),
    projectId,
  };
}

function viewUrl(endpoint: StorageEndpoint, bucketId: string, fileId: string): string {
  return `${endpoint.origin}${endpoint.path}/storage/buckets/${encodeURIComponent(bucketId)}/files/${encodeURIComponent(fileId)}/view?project=${encodeURIComponent(endpoint.projectId)}`;
}

export function buildStorageViewUrl(bucketId: string, fileId: string): string {
  const endpoint = resolveStorageEndpoint();
  if (!endpoint) throw new Error('Appwrite endpoint must be an https URL.');
  return viewUrl(endpoint, bucketId, fileId);
}

export function parseOwnedStorageUrl(url: string): OwnedStorageFile | null {
  const parsed = parseStorageViewPath(url);
  if (!parsed) return null;

  const endpoint = resolveStorageEndpoint();
  if (!endpoint) return null;
  if (parsed.host !== endpoint.host || parsed.endpointPath !== endpoint.path) return null;
  if (parsed.paramCount !== 1 || parsed.projectParams.length !== 1) return null;
  if (parsed.projectParams[0] !== endpoint.projectId) return null;

  return {
    bucketId: parsed.bucketId,
    fileId: parsed.fileId,
    canonicalUrl: viewUrl(endpoint, parsed.bucketId, parsed.fileId),
  };
}

export function isOwnedStorageUrl(url: string): boolean {
  return parseOwnedStorageUrl(url) !== null;
}

export function isOwnedStorageUrlInFolder(url: string, folder: AllowedImageFolder): boolean {
  return parseOwnedStorageUrl(url)?.bucketId === FOLDER_BUCKETS[folder];
}

export function bucketIdForFolder(folder: AllowedImageFolder): string {
  return FOLDER_BUCKETS[folder];
}
