'use server';

import { revalidatePath, updateTag } from 'next/cache';

import { uuid } from '@/features/admin/schemas/common';
import { reorderSchema } from '@/features/admin/schemas/reorder';
import { valuePropSchema } from '@/features/admin/schemas/valueProp';
import {
  type AdminActionFailure,
  failureFromUnknown,
  requireAdmin,
} from '@/features/admin/utils/auth';
import {
  fallbackValueProps,
  type ValuePropView,
} from '@/features/landing/queries/getPublishedValueProps';
import { getSiteSettings } from '@/features/settings/queries/getSiteSettings';
import {
  createValuePropDocument,
  deleteValuePropDocument,
  findValuePropById,
  getNextValuePropOrder,
  listValueProps,
  reorderValuePropsAppwrite,
  setValuePropActive,
  updateValuePropDocument,
  type ValuePropWritePayload,
} from '@/lib/appwrite/repositories/valueProps';
import { tokenizeValuePropIdentity } from '@/lib/valuePropIdentity';
import {
  HOME_VALUE_PROP_LIMIT,
  HOME_VALUE_PROP_LIMIT_COPY,
} from '@/lib/valuePropLimit';

type ValuePropActionResult = { success: true } | AdminActionFailure;

function revalidateValueProps(): void {
  revalidatePath('/', 'layout');
  revalidatePath('/admin/inicio');
  updateTag('value-props');
  updateTag('home-content');
}

function parseValuePropInput(data: unknown):
  | { ok: true; value: ReturnType<typeof valuePropSchema.parse> }
  | { ok: false; failure: AdminActionFailure } {
  const parsed = valuePropSchema.safeParse(data);
  if (!parsed.success) {
    return {
      ok: false,
      failure: {
        success: false,
        error: 'Datos inválidos. Revisa el destacado.',
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

async function toWritePayload(
  value: ReturnType<typeof valuePropSchema.parse>,
  displayOrder: number,
): Promise<ValuePropWritePayload> {
  const settings = await getSiteSettings();
  const tokenized = tokenizeValuePropIdentity(
    {
      description: value.description,
      href: value.href,
      isAnchor: value.isAnchor,
      isExternal: value.isExternal,
      linkLabel: value.linkLabel,
      title: value.title,
    },
    settings,
  );
  return {
    description: tokenized.description,
    displayOrder,
    endsAt: value.endsAt,
    href: tokenized.href,
    icon: value.icon,
    isActive: value.isActive,
    isAnchor: tokenized.isAnchor,
    isExternal: tokenized.isExternal,
    linkLabel: tokenized.linkLabel,
    startsAt: value.startsAt,
    title: tokenized.title,
  };
}

function activeCount(rows: { is_active: boolean }[]): number {
  return rows.filter((row) => row.is_active).length;
}

function limitFailure(): AdminActionFailure {
  return { success: false, error: HOME_VALUE_PROP_LIMIT_COPY, code: 'VALIDATION' };
}

async function payloadFromFallback(
  view: ValuePropView,
  displayOrder: number,
): Promise<ValuePropWritePayload> {
  const settings = await getSiteSettings();
  const tokenized = tokenizeValuePropIdentity(view, settings);
  return {
    description: tokenized.description,
    displayOrder,
    endsAt: null,
    href: tokenized.href,
    icon: view.icon,
    isActive: true,
    isAnchor: tokenized.isAnchor,
    isExternal: tokenized.isExternal,
    linkLabel: tokenized.linkLabel,
    startsAt: null,
    title: tokenized.title,
  };
}

async function seedFallbackDocuments(
  exceptId: string | undefined,
  replacement?: ValuePropWritePayload,
): Promise<void> {
  const fallbacks = fallbackValueProps(await getSiteSettings());
  for (const [index, item] of fallbacks.entries()) {
    const displayOrder = index + 1;
    if (exceptId && item.id === exceptId && replacement) {
      await createValuePropDocument({ ...replacement, displayOrder });
      continue;
    }
    await createValuePropDocument(await payloadFromFallback(item, displayOrder));
  }
}

export async function createValueProp(data: unknown): Promise<ValuePropActionResult> {
  try {
    await requireAdmin();
    const fromFallbackId = readFromFallbackId(data);
    const parsed = parseValuePropInput(data);
    if (!parsed.ok) return parsed.failure;
    const existing = await listValueProps();
    if (existing.length === 0) {
      const matchesFallback = fallbackValueProps(await getSiteSettings()).some(
        (item) => item.id === fromFallbackId,
      );
      if (matchesFallback) {
        await seedFallbackDocuments(fromFallbackId, await toWritePayload(parsed.value, 1));
      } else {
        await seedFallbackDocuments(undefined);
        if (parsed.value.isActive) return limitFailure();
        const displayOrder = await getNextValuePropOrder();
        await createValuePropDocument(await toWritePayload(parsed.value, displayOrder));
      }
      revalidateValueProps();
      return { success: true };
    }
    if (parsed.value.isActive && activeCount(existing) >= HOME_VALUE_PROP_LIMIT) {
      return limitFailure();
    }
    const displayOrder = await getNextValuePropOrder();
    await createValuePropDocument(await toWritePayload(parsed.value, displayOrder));
    revalidateValueProps();
    return { success: true };
  } catch (err) {
    return failureFromUnknown(err);
  }
}

export async function updateValueProp(id: string, data: unknown): Promise<ValuePropActionResult> {
  try {
    await requireAdmin();
    const idParsed = uuid.safeParse(id);
    if (!idParsed.success) {
      return { success: false, error: 'Identificador inválido.', code: 'VALIDATION', issues: idParsed.error.issues };
    }
    const parsed = parseValuePropInput(data);
    if (!parsed.ok) return parsed.failure;
    const existing = await findValuePropById(idParsed.data);
    if (!existing) {
      return { success: false, error: 'No encontramos ese destacado.', code: 'INTERNAL' };
    }
    if (parsed.value.isActive && !existing.is_active) {
      const others = await listValueProps();
      if (activeCount(others.filter((row) => row.id !== existing.id)) >= HOME_VALUE_PROP_LIMIT) {
        return limitFailure();
      }
    }
    await updateValuePropDocument(
      idParsed.data,
      await toWritePayload(parsed.value, existing.display_order),
    );
    revalidateValueProps();
    return { success: true };
  } catch (err) {
    return failureFromUnknown(err);
  }
}

export async function toggleValuePropStatus(
  id: string,
  isActive: boolean,
): Promise<ValuePropActionResult> {
  try {
    await requireAdmin();
    if (typeof isActive !== 'boolean') {
      return { success: false, error: 'Estado inválido.', code: 'VALIDATION' };
    }
    const existingRows = await listValueProps();
    if (existingRows.length === 0) {
      const fallback = fallbackValueProps(await getSiteSettings()).find((item) => item.id === id);
      if (!fallback) {
        return { success: false, error: 'No encontramos ese destacado.', code: 'INTERNAL' };
      }
      await seedFallbackDocuments(id, {
        ...(await payloadFromFallback(fallback, 1)),
        isActive,
      });
      revalidateValueProps();
      return { success: true };
    }
    const idParsed = uuid.safeParse(id);
    if (!idParsed.success) {
      return { success: false, error: 'Identificador inválido.', code: 'VALIDATION', issues: idParsed.error.issues };
    }
    const existing = await findValuePropById(idParsed.data);
    if (!existing) {
      return { success: false, error: 'No encontramos ese destacado.', code: 'INTERNAL' };
    }
    if (isActive && !existing.is_active && activeCount(existingRows) >= HOME_VALUE_PROP_LIMIT) {
      return limitFailure();
    }
    await setValuePropActive(idParsed.data, isActive);
    revalidateValueProps();
    return { success: true };
  } catch (err) {
    return failureFromUnknown(err);
  }
}

export async function reorderValueProps(ids: string[]): Promise<ValuePropActionResult> {
  try {
    await requireAdmin();
    const parsed = reorderSchema.safeParse({ ids });
    if (!parsed.success) {
      return { success: false, error: 'Lista de destacados inválida.', code: 'VALIDATION' };
    }
    await reorderValuePropsAppwrite(parsed.data.ids);
    revalidateValueProps();
    return { success: true };
  } catch (err) {
    return failureFromUnknown(err);
  }
}

export async function deleteValueProp(id: string): Promise<ValuePropActionResult> {
  try {
    await requireAdmin();
    const idParsed = uuid.safeParse(id);
    if (!idParsed.success) {
      return { success: false, error: 'Identificador inválido.', code: 'VALIDATION', issues: idParsed.error.issues };
    }
    const existing = await findValuePropById(idParsed.data);
    if (!existing) {
      return { success: false, error: 'No encontramos ese destacado.', code: 'INTERNAL' };
    }
    await deleteValuePropDocument(idParsed.data);
    revalidateValueProps();
    return { success: true };
  } catch (err) {
    return failureFromUnknown(err);
  }
}
