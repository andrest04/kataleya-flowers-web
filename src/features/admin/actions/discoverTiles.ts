'use server';

import { revalidatePath, updateTag } from 'next/cache';

import { uuid } from '@/features/admin/schemas/common';
import {
  discoverTileSchema,
  isDiscoverTileImageUrl,
} from '@/features/admin/schemas/discoverTile';
import { reorderSchema } from '@/features/admin/schemas/reorder';
import {
  type AdminActionFailure,
  failureFromUnknown,
  requireAdmin,
} from '@/features/admin/utils/auth';
import {
  type DiscoverTileView,
  fallbackDiscoverTiles,
} from '@/features/landing/queries/getPublishedDiscoverTiles';
import { getSiteSettings } from '@/features/settings/queries/getSiteSettings';
import { APPWRITE_BUCKETS } from '@/lib/appwrite/config';
import {
  createDiscoverTileDocument,
  deleteDiscoverTileDocument,
  type DiscoverTileWritePayload,
  findDiscoverTileById,
  getNextDiscoverTileOrder,
  listDiscoverTiles,
  reorderDiscoverTilesAppwrite,
  setDiscoverTileActive,
  updateDiscoverTileDocument,
} from '@/lib/appwrite/repositories/discoverTiles';
import {
  HOME_DISCOVER_TILE_LIMIT,
  HOME_DISCOVER_TILE_LIMIT_COPY,
} from '@/lib/discoverTileLimit';
import { imageStorage } from '@/lib/imageStorage';
import { parseAppwriteStorageUrl } from '@/lib/imageStorage/urlValidation';

type DiscoverTileActionResult = { success: true } | AdminActionFailure;

function revalidateHomeContent(): void {
  revalidatePath('/');
  revalidatePath('/admin/inicio');
  updateTag('home-content');
}

function isContentImage(url: string): boolean {
  return parseAppwriteStorageUrl(url)?.bucketId === APPWRITE_BUCKETS.content;
}

function ensureDiscoverTileImage(url: string): string | AdminActionFailure {
  if (isDiscoverTileImageUrl(url)) return url;
  return {
    success: false,
    error: 'La imagen debe servirse desde el storage propio o una ruta pública del sitio',
    code: 'VALIDATION',
  };
}

async function parseDiscoverTileInput(data: unknown): Promise<
  | { ok: true; value: ReturnType<typeof discoverTileSchema.parse> }
  | { ok: false; failure: AdminActionFailure }
> {
  if (!data || typeof data !== 'object' || !('imageUrl' in data) || typeof data.imageUrl !== 'string') {
    return {
      ok: false,
      failure: { success: false, error: 'Datos inválidos. Revisa la tarjeta.', code: 'VALIDATION' },
    };
  }
  const storedUrl = ensureDiscoverTileImage(data.imageUrl);
  if (typeof storedUrl !== 'string') return { ok: false, failure: storedUrl };
  const parsed = discoverTileSchema.safeParse({ ...data, imageUrl: storedUrl });
  if (!parsed.success) {
    return {
      ok: false,
      failure: {
        success: false,
        error: 'Datos inválidos. Revisa la tarjeta.',
        code: 'VALIDATION',
        issues: parsed.error.issues,
      },
    };
  }
  return { ok: true, value: parsed.data };
}

function readFromFallbackId(data: unknown): string | undefined {
  if (!data || typeof data !== 'object' || !('fromFallbackId' in data)) return undefined;
  const value = data.fromFallbackId;
  return typeof value === 'string' && value.trim() !== '' ? value : undefined;
}

function toWritePayload(
  value: ReturnType<typeof discoverTileSchema.parse>,
  displayOrder: number,
): DiscoverTileWritePayload {
  return {
    description: value.description,
    displayOrder,
    endsAt: value.endsAt,
    href: value.href,
    icon: value.icon,
    imageUrl: value.imageUrl,
    isActive: value.isActive,
    isExternal: value.isExternal,
    startsAt: value.startsAt,
    title: value.title,
  };
}

function activeCount(rows: { is_active: boolean }[]): number {
  return rows.filter((row) => row.is_active).length;
}

function limitFailure(): AdminActionFailure {
  return { success: false, error: HOME_DISCOVER_TILE_LIMIT_COPY, code: 'VALIDATION' };
}

function payloadFromFallback(
  view: DiscoverTileView,
  displayOrder: number,
  imageUrl: string,
): DiscoverTileWritePayload {
  return {
    description: view.description,
    displayOrder,
    endsAt: null,
    href: view.href,
    icon: view.icon,
    imageUrl,
    isActive: true,
    isExternal: view.external,
    startsAt: null,
    title: view.title,
  };
}

async function seedFallbackDocuments(
  exceptId: string | undefined,
  replacement?: DiscoverTileWritePayload,
): Promise<AdminActionFailure | null> {
  const fallbacks = fallbackDiscoverTiles(await getSiteSettings());
  for (const [index, item] of fallbacks.entries()) {
    const displayOrder = index + 1;
    if (exceptId && item.id === exceptId && replacement) {
      await createDiscoverTileDocument({ ...replacement, displayOrder });
      continue;
    }
    const storedUrl = ensureDiscoverTileImage(item.imageSrc);
    if (typeof storedUrl !== 'string') return storedUrl;
    await createDiscoverTileDocument(payloadFromFallback(item, displayOrder, storedUrl));
  }
  return null;
}

export async function createDiscoverTile(data: unknown): Promise<DiscoverTileActionResult> {
  try {
    await requireAdmin();
    const fromFallbackId = readFromFallbackId(data);
    const parsed = await parseDiscoverTileInput(data);
    if (!parsed.ok) return parsed.failure;
    const existing = await listDiscoverTiles();
    if (existing.length === 0) {
      const matchesFallback = fallbackDiscoverTiles(await getSiteSettings()).some(
        (item) => item.id === fromFallbackId,
      );
      if (matchesFallback) {
        const seedError = await seedFallbackDocuments(
          fromFallbackId,
          toWritePayload(parsed.value, 1),
        );
        if (seedError) return seedError;
      } else {
        const seedError = await seedFallbackDocuments(undefined);
        if (seedError) return seedError;
        if (parsed.value.isActive) return limitFailure();
        const displayOrder = await getNextDiscoverTileOrder();
        await createDiscoverTileDocument(toWritePayload(parsed.value, displayOrder));
      }
      revalidateHomeContent();
      return { success: true };
    }
    if (parsed.value.isActive && activeCount(existing) >= HOME_DISCOVER_TILE_LIMIT) {
      return limitFailure();
    }
    const displayOrder = await getNextDiscoverTileOrder();
    await createDiscoverTileDocument(toWritePayload(parsed.value, displayOrder));
    revalidateHomeContent();
    return { success: true };
  } catch (err) {
    return failureFromUnknown(err);
  }
}

export async function updateDiscoverTile(id: string, data: unknown): Promise<DiscoverTileActionResult> {
  try {
    await requireAdmin();
    const idParsed = uuid.safeParse(id);
    if (!idParsed.success) {
      return { success: false, error: 'Identificador inválido.', code: 'VALIDATION', issues: idParsed.error.issues };
    }
    const parsed = await parseDiscoverTileInput(data);
    if (!parsed.ok) return parsed.failure;
    const existing = await findDiscoverTileById(idParsed.data);
    if (!existing) {
      return { success: false, error: 'No encontramos esa tarjeta.', code: 'INTERNAL' };
    }
    if (parsed.value.isActive && !existing.is_active) {
      const others = await listDiscoverTiles();
      if (activeCount(others.filter((row) => row.id !== existing.id)) >= HOME_DISCOVER_TILE_LIMIT) {
        return limitFailure();
      }
    }
    await updateDiscoverTileDocument(
      idParsed.data,
      toWritePayload(parsed.value, existing.display_order),
    );
    revalidateHomeContent();
    return { success: true };
  } catch (err) {
    return failureFromUnknown(err);
  }
}

export async function toggleDiscoverTileStatus(
  id: string,
  isActive: boolean,
): Promise<DiscoverTileActionResult> {
  try {
    await requireAdmin();
    if (typeof isActive !== 'boolean') {
      return { success: false, error: 'Estado inválido.', code: 'VALIDATION' };
    }
    const existingRows = await listDiscoverTiles();
    if (existingRows.length === 0) {
      const fallback = fallbackDiscoverTiles(await getSiteSettings()).find((item) => item.id === id);
      if (!fallback) {
        return { success: false, error: 'No encontramos esa tarjeta.', code: 'INTERNAL' };
      }
      const storedUrl = ensureDiscoverTileImage(fallback.imageSrc);
      if (typeof storedUrl !== 'string') return storedUrl;
      const seedError = await seedFallbackDocuments(id, {
        ...payloadFromFallback(fallback, 1, storedUrl),
        isActive,
      });
      if (seedError) return seedError;
      revalidateHomeContent();
      return { success: true };
    }
    const idParsed = uuid.safeParse(id);
    if (!idParsed.success) {
      return { success: false, error: 'Identificador inválido.', code: 'VALIDATION', issues: idParsed.error.issues };
    }
    const existing = await findDiscoverTileById(idParsed.data);
    if (!existing) {
      return { success: false, error: 'No encontramos esa tarjeta.', code: 'INTERNAL' };
    }
    if (isActive && !existing.is_active && activeCount(existingRows) >= HOME_DISCOVER_TILE_LIMIT) {
      return limitFailure();
    }
    await setDiscoverTileActive(idParsed.data, isActive);
    revalidateHomeContent();
    return { success: true };
  } catch (err) {
    return failureFromUnknown(err);
  }
}

export async function reorderDiscoverTiles(ids: string[]): Promise<DiscoverTileActionResult> {
  try {
    await requireAdmin();
    const parsed = reorderSchema.safeParse({ ids });
    if (!parsed.success) {
      return { success: false, error: 'Lista de tarjetas inválida.', code: 'VALIDATION' };
    }
    await reorderDiscoverTilesAppwrite(parsed.data.ids);
    revalidateHomeContent();
    return { success: true };
  } catch (err) {
    return failureFromUnknown(err);
  }
}

export async function deleteDiscoverTile(id: string): Promise<DiscoverTileActionResult> {
  try {
    await requireAdmin();
    const idParsed = uuid.safeParse(id);
    if (!idParsed.success) {
      return { success: false, error: 'Identificador inválido.', code: 'VALIDATION', issues: idParsed.error.issues };
    }
    const existing = await findDiscoverTileById(idParsed.data);
    if (!existing) {
      return { success: false, error: 'No encontramos esa tarjeta.', code: 'INTERNAL' };
    }
    const imageUrl = await deleteDiscoverTileDocument(idParsed.data);
    if (imageUrl && isContentImage(imageUrl)) void imageStorage.delete(imageUrl);
    revalidateHomeContent();
    return { success: true };
  } catch (err) {
    return failureFromUnknown(err);
  }
}
