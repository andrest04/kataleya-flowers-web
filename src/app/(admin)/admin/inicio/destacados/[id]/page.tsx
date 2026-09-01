import Link from 'next/link';
import { notFound } from 'next/navigation';

import ValuePropEditor from '@/features/admin/components/ValuePropEditor';
import { draftFromValueProp } from '@/features/admin/components/ValuePropEditor/mapDraft';
import { getAdminValuePropById, getAdminValueProps } from '@/features/admin/queries/valueProps';
import { HOME_VALUE_PROP_LIMIT } from '@/lib/valuePropLimit';

interface EditarDestacadoPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: EditarDestacadoPageProps) {
  const { id } = await params;
  const item = await getAdminValuePropById(id);
  return { title: item ? `Editar ${item.title}` : 'Editar destacado' };
}

export default async function EditarDestacadoPage({ params }: EditarDestacadoPageProps) {
  const { id } = await params;
  const [item, items] = await Promise.all([
    getAdminValuePropById(id),
    getAdminValueProps(),
  ]);
  if (!item) notFound();
  const activeCount = items.filter((row) => row.is_active).length;
  const allowActivate = item.is_active || activeCount < HOME_VALUE_PROP_LIMIT;

  return (
    <div className="space-y-6">
      <Link
        href="/admin/inicio"
        className="text-sm text-(--color-muted) transition-opacity hover:opacity-70"
      >
        ← Volver a inicio
      </Link>
      <div>
        <h1 className="font-serif text-2xl font-semibold text-(--color-dark)">Editar destacado</h1>
      </div>
      <ValuePropEditor
        allowActivate={allowActivate}
        allowHide
        initial={draftFromValueProp(item)}
        valuePropId={item.id}
      />
    </div>
  );
}
