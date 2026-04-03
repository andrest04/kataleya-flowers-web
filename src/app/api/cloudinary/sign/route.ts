import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { folder } = (await request.json()) as { folder?: string };

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json(
      { error: 'Cloudinary credentials not configured' },
      { status: 500 },
    );
  }

  const timestamp = Math.floor(Date.now() / 1000);

  // Build params to sign (alphabetical order, excluding file & api_key)
  const params: Record<string, string | number> = { timestamp };
  if (folder) params.folder = folder;

  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');

  const signature = createHash('sha1')
    .update(sortedParams + apiSecret)
    .digest('hex');

  return NextResponse.json({
    signature,
    timestamp,
    apiKey,
    cloudName,
    folder: folder ?? '',
  });
}
