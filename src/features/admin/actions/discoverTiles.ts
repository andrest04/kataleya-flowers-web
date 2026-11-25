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
  createOrderableHomeCollection,
  readFromFallbackId,
} from '@/features/admin/utils/orderableHomeCollection';
import {
  type DiscoverTileView,
  fallbackDiscoverTiles,
} from '@/features/landing/queries/getPublishedDiscoverTiles';
import {
  HOME_DISCOVER_TILE_LIMIT,
  HOME_DISCOVER_TILE_LIMIT_COPY,
} from '@/features/landing/rules/discoverTileLimit';
import { getSiteSettings } from '@/features/settings/queries/getSiteSettings';
import { documentStore } from '@/lib/database';
import {
  discoverTileRepository,
  type DiscoverTileWritePayload,
} from '@/lib/database/repositories/discoverTiles';
import { discoverTileConfig } from '@/lib/database/repositories/discoverTiles/config';
import { imageStorage } from '@/lib/imageStorage';

type DiscoverTileActionResult = { success: true } | AdminActionFailure;

function revalidateHomeContent(): void {
  revalidatePath('/');
  revalidatePath('/admin/inicio');
  updateTag('home-content');
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

const discoverTiles = createOrderableHomeCollection({
  store: documentStore,
  config: discoverTileConfig,
  repository: discoverTileRepository,
  activeLimit: HOME_DISCOVER_TILE_LIMIT,
  limitCopy: HOME_DISCOVER_TILE_LIMIT_COPY,
  notFoundCopy: 'No encontramos esa tarjeta.',
  loadFallbacks: async () => fallbackDiscoverTiles(await getSiteSettings()),
  payloadFromFallback: (view, displayOrder) => {
    const storedUrl = ensureDiscoverTileImage(view.imageSrc);
    if (typeof storedUrl !== 'string') return { ok: false, failure: storedUrl };
    return { ok: true, payload: payloadFromFallback(view, displayOrder, storedUrl) };
  },
});

export async function createDiscoverTile(data: unknown): Promise<DiscoverTileActionResult> {
  try {
    await requireAdmin();
    const parsed = await parseDiscoverTileInput(data);
    if (!parsed.ok) return parsed.failure;
    const failure = await discoverTiles.create({
      fromFallbackId: readFromFallbackId(data),
      isActive: parsed.value.isActive,
      toPayload: (displayOrder) => toWritePayload(parsed.value, displayOrder),
    });
    if (failure) return failure;
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
    const existing = await discoverTileRepository.findById(idParsed.data);
    if (!existing) {
      return { success: false, error: 'No encontramos esa tarjeta.', code: 'INTERNAL' };
    }
    const activationFailure = await discoverTiles.activationFailure(existing, parsed.value.isActive);
    if (activationFailure) return activationFailure;
    await discoverTileRepository.update(
      idParsed.data,
      toWritePayload(parsed.value, existing.displayOrder),
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
    const failure = await discoverTiles.toggle(id, isActive);
    if (failure) return failure;
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
    await discoverTileRepository.reorder(parsed.data.ids);
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
    const existing = await discoverTileRepository.findById(idParsed.data);
    if (!existing) {
      return { success: false, error: 'No encontramos esa tarjeta.', code: 'INTERNAL' };
    }
    const imageUrl = await discoverTileRepository.delete(idParsed.data);
    if (imageUrl && imageStorage.isOwnedUrlInFolder(imageUrl, 'contenido')) void imageStorage.delete(imageUrl);
    revalidateHomeContent();
    return { success: true };
  } catch (err) {
    return failureFromUnknown(err);
  }
}
