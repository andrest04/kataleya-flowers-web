import Link from 'next/link';
import { notFound } from 'next/navigation';

import ComplaintDetail from '@/features/complaints/components/admin/ComplaintDetail';
import ComplaintStatusForm from '@/features/complaints/components/admin/ComplaintStatusForm';
import { getComplaintById } from '@/features/complaints/queries/complaints';

export const metadata = { title: 'Detalle del reclamo' };

interface AdminReclamoDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminReclamoDetailPage({
  params,
}: AdminReclamoDetailPageProps) {
  const { id } = await params;
  const complaint = await getComplaintById(id);

  if (!complaint) notFound();

  return (
    <div className="space-y-6">
      <Link
        href="/admin/reclamos"
        className="text-sm underline-offset-2 hover:underline"
        style={{ color: 'var(--color-primary)' }}
      >
        ← Volver a reclamos
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <section
          className="rounded-xl border p-6"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-white)' }}
        >
          <ComplaintDetail complaint={complaint} />
        </section>

        <section
          className="rounded-xl border p-6 h-fit"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-white)' }}
        >
          <h2 className="font-serif text-lg font-semibold mb-4" style={{ color: 'var(--color-dark)' }}>
            Respuesta del proveedor
          </h2>
          <ComplaintStatusForm
            id={complaint.id}
            status={complaint.status}
            providerResponse={complaint.provider_response}
          />
        </section>
      </div>
    </div>
  );
}
