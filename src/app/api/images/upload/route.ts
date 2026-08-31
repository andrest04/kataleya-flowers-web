import { NextResponse } from 'next/server';

import { AdminAuthError } from '@/features/admin/utils/auth';
import { requireAdminAppwrite } from '@/features/admin/utils/auth.appwrite';
import { imageStorage, isAllowedImageFolder } from '@/lib/imageStorage';
import { MAX_IMAGE_FILE_SIZE, validateImageBytes } from '@/lib/imageStorage/validateImageBytes';

export async function POST(request: Request) {
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

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  const file = formData.get('file');
  const folder = formData.get('folder');

  if (!isAllowedImageFolder(folder)) {
    console.warn('[images/upload] folder rechazado', { folder });
    return NextResponse.json(
        { error: 'invalid_folder', message: 'Folder debe ser uno de: productos, categorias, contenido' },
      { status: 400 },
    );
  }

  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: 'invalid_file' }, { status: 400 });
  }
  if (file.size > MAX_IMAGE_FILE_SIZE) {
    return NextResponse.json(
      { error: 'file_too_large', message: 'La imagen no puede superar 10 MB' },
      { status: 400 },
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const validation = validateImageBytes(buffer, file.type || null);
    if (!validation.ok) {
      const message =
        validation.error === 'file_too_large'
          ? 'La imagen no puede superar 10 MB'
          : validation.error === 'mime_mismatch'
            ? 'El tipo declarado no coincide con el contenido de la imagen'
            : 'El archivo debe ser una imagen válida';
      return NextResponse.json({ error: validation.error, message }, { status: 400 });
    }

    const filename = file instanceof File ? file.name : 'upload';

    const url = await imageStorage.upload({
      folder,
      buffer,
      filename,
      mimeType: validation.mimeType,
    });

    return NextResponse.json({ url });
  } catch (err) {
    console.error('[images/upload] fallo inesperado', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'upload_failed' }, { status: 500 });
  }
}
