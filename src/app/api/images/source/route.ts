import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { NextResponse } from 'next/server';

import { AdminAuthError } from '@/features/admin/utils/auth';
import { requireAdminAppwrite } from '@/features/admin/utils/auth.appwrite';
import { isAppwriteStorageUrl } from '@/lib/imageStorage/urlValidation';

const LOCAL_IMAGE = /^\/images\/[a-z0-9/_-]+\.(jpg|jpeg|png|webp|avif)$/i;

export async function GET(request: Request) {
  try {
    await requireAdminAppwrite();
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

  if (LOCAL_IMAGE.test(url) && !url.includes('..')) {
    try {
      const filePath = path.join(process.cwd(), 'public', url.replace(/^\//, ''));
      const buffer = await readFile(filePath);
      return new NextResponse(buffer, {
        headers: { 'Content-Type': 'image/jpeg', 'Cache-Control': 'no-store' },
      });
    } catch {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }
  }

  if (!isAppwriteStorageUrl(url)) {
    return NextResponse.json({ error: 'invalid_url' }, { status: 400 });
  }

  const response = await fetch(url);
  if (!response.ok) {
    return NextResponse.json({ error: 'fetch_failed' }, { status: 502 });
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': response.headers.get('Content-Type') ?? 'image/jpeg',
      'Cache-Control': 'no-store',
    },
  });
}
