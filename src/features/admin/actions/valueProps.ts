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
  createOrderableHomeCollection,
  readFromFallbackId,
} from '@/features/admin/utils/orderableHomeCollection';
import {
  fallbackValueProps,
  type ValuePropView,
} from '@/features/landing/queries/getPublishedValueProps';
import { tokenizeValuePropIdentity } from '@/features/landing/rules/valuePropIdentity';
import {
  HOME_VALUE_PROP_LIMIT,
  HOME_VALUE_PROP_LIMIT_COPY,
} from '@/features/landing/rules/valuePropLimit';
import { getSiteSettings } from '@/features/settings/queries/getSiteSettings';
import { documentStore } from '@/lib/database';
import {
  valuePropRepository,
  type ValuePropWritePayload,
} from '@/lib/database/repositories/valueProps';
import { valuePropConfig } from '@/lib/database/repositories/valueProps/config';

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

const valueProps = createOrderableHomeCollection({
  store: documentStore,
  config: valuePropConfig,
  repository: valuePropRepository,
  activeLimit: HOME_VALUE_PROP_LIMIT,
  limitCopy: HOME_VALUE_PROP_LIMIT_COPY,
  notFoundCopy: 'No encontramos ese destacado.',
  loadFallbacks: async () => fallbackValueProps(await getSiteSettings()),
  payloadFromFallback: async (view, displayOrder) => ({
    ok: true,
    payload: await payloadFromFallback(view, displayOrder),
  }),
});

export async function createValueProp(data: unknown): Promise<ValuePropActionResult> {
  try {
    await requireAdmin();
    const parsed = parseValuePropInput(data);
    if (!parsed.ok) return parsed.failure;
    const failure = await valueProps.create({
      fromFallbackId: readFromFallbackId(data),
      isActive: parsed.value.isActive,
      toPayload: (displayOrder) => toWritePayload(parsed.value, displayOrder),
    });
    if (failure) return failure;
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
    const existing = await valuePropRepository.findById(idParsed.data);
    if (!existing) {
      return { success: false, error: 'No encontramos ese destacado.', code: 'INTERNAL' };
    }
    const activationFailure = await valueProps.activationFailure(existing, parsed.value.isActive);
    if (activationFailure) return activationFailure;
    await valuePropRepository.update(
      idParsed.data,
      await toWritePayload(parsed.value, existing.displayOrder),
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
    const failure = await valueProps.toggle(id, isActive);
    if (failure) return failure;
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
    await valuePropRepository.reorder(parsed.data.ids);
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
    const existing = await valuePropRepository.findById(idParsed.data);
    if (!existing) {
      return { success: false, error: 'No encontramos ese destacado.', code: 'INTERNAL' };
    }
    await valuePropRepository.delete(idParsed.data);
    revalidateValueProps();
    return { success: true };
  } catch (err) {
    return failureFromUnknown(err);
  }
}
