import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { NextResponse } from 'next/server';

import { AdminAuthError, requireAdmin } from '@/features/admin/utils/auth';
import { parseOwnedStorageUrl } from '@/lib/imageStorage/ownership';
import { validateImageBytes } from '@/lib/imageStorage/validateImageBytes';

const LOCAL_IMAGE = /^\/images\/[a-z0-9/_-]+\.(jpg|jpeg|png|webp|avif)$/i;
const MAX_UPSTREAM_IMAGE_BYTES = 15 * 1024 * 1024;

const LOCAL_IMAGE_MIME: Record<string, string> = {
  avif: 'image/avif',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

function imageResponse(buffer: Buffer<ArrayBuffer>, mimeType: string): NextResponse {
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': mimeType,
      'Cache-Control': 'no-store',
      'Content-Disposition': 'inline',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': 'sandbox',
    },
  });
}

async function readCappedBody(response: Response, limit: number): Promise<Buffer<ArrayBuffer> | null> {
  const declaredLength = Number(response.headers.get('Content-Length') ?? 0);
  if (!Number.isFinite(declaredLength) || declaredLength > limit) return null;
  if (!response.body) return Buffer.alloc(0);

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > limit) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks);
}

export async function GET(request: Request) {
  try {
    await requireAdmin();
  } catch (err) {
    if (err instanceof AdminAuthError) {
      return NextResponse.json(
        { error: err.code === 'UNAUTHENTICATED' ? 'unauthenticated' : 'forbidden' },
        { status: err.code === 'UNAUTHENTICATED' ? 401 : 403 },
      );
    }
    throw err;
  }

  const url = new URL(request.url).searchParams.get('url');
  if (!url) {
    return NextResponse.json({ error: 'invalid_url' }, { status: 400 });
  }

  const localMatch = LOCAL_IMAGE.exec(url);
  if (localMatch && !url.includes('..')) {
    try {
      const filePath = path.join(process.cwd(), 'public', url.replace(/^\//, ''));
      const buffer = await readFile(filePath);
      return imageResponse(buffer, LOCAL_IMAGE_MIME[localMatch[1].toLowerCase()]);
    } catch {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }
  }

  const owned = parseOwnedStorageUrl(url);
  if (!owned) {
    return NextResponse.json({ error: 'invalid_url' }, { status: 400 });
  }

  let buffer: Buffer<ArrayBuffer> | null;
  try {
    const response = await fetch(owned.canonicalUrl, { redirect: 'manual' });
    if (!response.ok) {
      return NextResponse.json({ error: 'fetch_failed' }, { status: 502 });
    }
    buffer = await readCappedBody(response, MAX_UPSTREAM_IMAGE_BYTES);
  } catch {
    return NextResponse.json({ error: 'fetch_failed' }, { status: 502 });
  }

  if (!buffer) {
    return NextResponse.json({ error: 'image_too_large' }, { status: 502 });
  }

  const validation = validateImageBytes(buffer, null);
  if (!validation.ok) {
    return NextResponse.json({ error: 'invalid_image' }, { status: 502 });
  }

  return imageResponse(buffer, validation.mimeType);
}
