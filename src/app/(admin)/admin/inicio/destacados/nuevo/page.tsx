import Link from 'next/link';

import ValuePropEditor from '@/features/admin/components/ValuePropEditor';
import { draftFromFallback } from '@/features/admin/components/ValuePropEditor/mapDraft';
import { getAdminValueProps } from '@/features/admin/queries/valueProps';
import {
  FALLBACK_VALUE_PROPS,
  getPublishedValueProps,
} from '@/features/landing/queries/getPublishedValueProps';
import { HOME_VALUE_PROP_LIMIT } from '@/lib/valuePropLimit';

export const metadata = { title: 'Nuevo destacado' };

interface NuevoDestacadoPageProps {
  searchParams: Promise<{ from?: string }>;
}

export default async function NuevoDestacadoPage({ searchParams }: NuevoDestacadoPageProps) {
  const { from } = await searchParams;
  const [items, liveItems] = await Promise.all([
    getAdminValueProps(),
    getPublishedValueProps(),
  ]);
  const fromFallback = FALLBACK_VALUE_PROPS.find((item) => item.id === from);
  const source = fromFallback ?? liveItems[0] ?? FALLBACK_VALUE_PROPS[0];
  const isEditingFallback = Boolean(fromFallback) && items.length === 0;
  const initial = {
    ...draftFromFallback(source),
    isActive: isEditingFallback,
  };
  const activeCount = items.length === 0
    ? FALLBACK_VALUE_PROPS.length
    : items.filter((item) => item.is_active).length;
  const allowActivate = initial.isActive || activeCount < HOME_VALUE_PROP_LIMIT;

  return (
    <div className="space-y-6">
      <Link
        href="/admin/inicio"
        className="text-sm text-(--color-muted) transition-opacity hover:opacity-70"
      >
        ← Volver a inicio
      </Link>
      <h1 className="font-serif text-2xl font-semibold text-(--color-dark)">
        {isEditingFallback ? 'Editar destacado' : 'Nuevo destacado'}
      </h1>
      <ValuePropEditor
        allowActivate={allowActivate}
        allowHide
        fromFallbackId={fromFallback?.id}
        initial={initial}
        showCancel
      />
    </div>
  );
}
