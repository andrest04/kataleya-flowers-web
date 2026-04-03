import { createHash } from 'node:crypto';

/**
 * Extracts the Cloudinary public_id from a secure_url.
 * Example: "https://res.cloudinary.com/dbjm18dqg/image/upload/v1774299537/productos/ramo_abc.jpg"
 *       → "productos/ramo_abc"
 */
function extractPublicId(url: string): string | null {
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+$/);
  return match?.[1] ?? null;
}

/**
 * Deletes an image from Cloudinary by its URL.
 * Fails silently (logs error) — deleting from Cloudinary should not block DB operations.
 */
export async function destroyCloudinaryImage(url: string): Promise<void> {
  if (!url || !url.includes('res.cloudinary.com')) return;

  const publicId = extractPublicId(url);
  if (!publicId) return;

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) return;

  const timestamp = Math.floor(Date.now() / 1000);
  const toSign = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
  const signature = createHash('sha1').update(toSign).digest('hex');

  try {
    await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        public_id: publicId,
        api_key: apiKey,
        timestamp,
        signature,
      }),
    });
  } catch {
    // Silent fail — Cloudinary cleanup is best-effort
  }
}

/**
 * Deletes multiple images from Cloudinary.
 */
export async function destroyCloudinaryImages(urls: string[]): Promise<void> {
  await Promise.allSettled(urls.filter(Boolean).map(destroyCloudinaryImage));
}
