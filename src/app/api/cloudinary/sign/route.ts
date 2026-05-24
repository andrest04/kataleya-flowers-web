import { createHash } from 'node:crypto';

import { NextResponse } from 'next/server';

import { isAdminUser } from '@/features/admin/utils/adminMembership';
import {
  ALLOWED_FOLDERS,
  isAllowedFolder,
} from '@/features/admin/utils/cloudinaryUrl';
import { createClient } from '@/lib/supabase/server';

interface SignRequestBody {
  folder?: unknown;
}

/**
 * Genera firmas de upload para Cloudinary.
 *
 * Defensa en capas:
 * 1. Sesión válida obligatoria (`auth.getUser()`).
 * 2. Folder restringido a un allowlist (`productos`, `categorias`).
 * 3. Firmamos también `allowed_formats` y `max_file_size` para que la subida
 *    real las respete server-side en Cloudinary.
 *
 * Nunca logueamos el `apiSecret` ni el `signature` generado.
 */
export async function POST(request: Request) {
  // ── 1. Auth ───────────────────────────────────────────────────────────────
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }

  const isAdmin = await isAdminUser(supabase, user.id);
  if (!isAdmin) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  // ── 2. Parsear body con manejo defensivo ──────────────────────────────────
  let body: SignRequestBody = {};
  try {
    body = (await request.json()) as SignRequestBody;
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  // ── 3. Validar folder ─────────────────────────────────────────────────────
  if (!isAllowedFolder(body.folder)) {
    console.warn(
      '[cloudinary/sign] folder rechazado',
      { user: user.id, folder: body.folder },
    );
    return NextResponse.json(
      {
        error: 'invalid_folder',
        message: `Folder debe ser uno de: ${ALLOWED_FOLDERS.join(', ')}`,
      },
      { status: 400 },
    );
  }
  const folder = body.folder;

  // ── 4. Validar credenciales ───────────────────────────────────────────────
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    console.error('[cloudinary/sign] credenciales no configuradas');
    return NextResponse.json(
      { error: 'cloudinary_not_configured' },
      { status: 500 },
    );
  }

  // ── 5. Construir parámetros firmados ──────────────────────────────────────
  const timestamp = Math.floor(Date.now() / 1000);
  const allowedFormats = 'jpg,jpeg,png,webp,avif';
  const maxFileSize = 10 * 1024 * 1024; // 10 MB — coincide con useImageUpload

  const params: Record<string, string | number> = {
    timestamp,
    folder,
    allowed_formats: allowedFormats,
    max_file_size: maxFileSize,
  };

  // Firma alfabética de los params (excluye file/api_key/signature)
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
    folder,
    allowedFormats,
    maxFileSize,
  });
}
