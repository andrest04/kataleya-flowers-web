import { NextResponse } from 'next/server';

import { isAdminUserAppwrite } from '@/features/admin/utils/adminMembership.appwrite';
import { getUser } from '@/lib/appwrite/account';
import { getSessionCookie } from '@/lib/appwrite/cookies';
import { imageStorage, isAllowedImageFolder } from '@/lib/imageStorage';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB — coincide con useImageUpload

/**
 * Sube una imagen a Appwrite Storage.
 *
 * Defensa en capas:
 * 1. Sesión válida obligatoria (`auth.getUser()`) + membresía admin.
 * 2. Folder restringido a un allowlist (`productos`, `categorias`).
 * 3. Tipo/tamaño de archivo validados server-side (no confiar solo en el cliente).
 *
 * Nunca logueamos el contenido del archivo ni secretos.
 */
export async function POST(request: Request) {
  // ── 1. Auth ───────────────────────────────────────────────────────────────
  const sessionSecret = await getSessionCookie();
  if (!sessionSecret) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }
  const appwriteUser = await getUser(sessionSecret);
  if (!appwriteUser) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }
  const isAdmin = await isAdminUserAppwrite(appwriteUser.$id);
  if (!isAdmin) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  // ── 2. Parsear form-data con manejo defensivo ─────────────────────────────
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  const file = formData.get('file');
  const folder = formData.get('folder');

  // ── 3. Validar folder ─────────────────────────────────────────────────────
  if (!isAllowedImageFolder(folder)) {
    console.warn('[images/upload] folder rechazado', { folder });
    return NextResponse.json(
      { error: 'invalid_folder', message: 'Folder debe ser uno de: productos, categorias' },
      { status: 400 },
    );
  }

  // ── 4. Validar archivo ─────────────────────────────────────────────────────
  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: 'invalid_file' }, { status: 400 });
  }
  if (!file.type.startsWith('image/')) {
    return NextResponse.json(
      { error: 'invalid_file_type', message: 'El archivo debe ser una imagen' },
      { status: 400 },
    );
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: 'file_too_large', message: 'La imagen no puede superar 10 MB' },
      { status: 400 },
    );
  }

  // ── 5. Subir ───────────────────────────────────────────────────────────────
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = file instanceof File ? file.name : 'upload';

    const url = await imageStorage.upload({
      folder,
      buffer,
      filename,
      mimeType: file.type,
    });

    return NextResponse.json({ url });
  } catch (err) {
    console.error('[images/upload] fallo inesperado', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'upload_failed' }, { status: 500 });
  }
}
