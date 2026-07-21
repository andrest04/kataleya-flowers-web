import { headers } from 'next/headers';

const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 3;

interface Bucket {
  count: number;
  resetAt: number;
}

// Módulo en memoria del proceso: suficiente para frenar spam de script en un
// solo server, no es un límite distribuido. Combinado con la validación zod
// existente, cubre el caso real (nadie legítimo envía 3+ reclamos en 15min).
const buckets = new Map<string, Bucket>();

export function checkComplaintRateLimit(key: string): boolean {
  const now = Date.now();

  for (const [bucketKey, bucket] of buckets) {
    if (now >= bucket.resetAt) buckets.delete(bucketKey);
  }

  const bucket = buckets.get(key);
  if (!bucket) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  if (bucket.count >= MAX_REQUESTS) return false;

  bucket.count += 1;
  return true;
}

export async function getClientIp(): Promise<string> {
  const headerList = await headers();
  const forwardedFor = headerList.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0].trim();
  return headerList.get('x-real-ip') ?? 'unknown';
}
