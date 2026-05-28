import { Clock } from 'lucide-react';
import type { Metadata } from 'next';

import Breadcrumb from '@/components/ui/Breadcrumb';
import SectionHeader from '@/components/ui/SectionHeader';
import ComplaintForm from '@/features/complaints/components/ComplaintForm';
import OtherContactMethods from '@/features/complaints/components/OtherContactMethods';
import { RESPONSE_BUSINESS_DAYS } from '@/features/complaints/utils/format';
import { BUSINESS } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Libro de Reclamaciones',
  description:
    'Registra tu queja o reclamo conforme al Código de Protección y Defensa del Consumidor (INDECOPI).',
  alternates: { canonical: '/libro-de-reclamaciones' },
  openGraph: {
    title: 'Libro de Reclamaciones',
    description:
      'Registra tu queja o reclamo conforme al Código de Protección y Defensa del Consumidor (INDECOPI).',
    url: '/libro-de-reclamaciones',
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
};

export default function LibroDeReclamacionesPage() {
  return (
    <main id="main-content" className="bg-(--color-cream)">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
        <Breadcrumb
          items={[
            { label: 'Inicio', href: '/' },
            { label: 'Libro de Reclamaciones' },
          ]}
        />

        <SectionHeader
          align="left"
          as="h1"
          subtitle="INDECOPI"
          title="Libro de Reclamaciones"
          description="Registra tu queja o reclamo. Te responderemos dentro del plazo legal."
        />

        <div
          className="mt-8 rounded-xl border p-5"
          style={{
            borderColor: 'color-mix(in srgb, var(--color-secondary) 40%, var(--color-border))',
            background: 'var(--color-white)',
          }}
        >
          <p className="text-sm font-semibold text-(--color-dark)">Datos del proveedor</p>
          <p className="mt-1 text-sm text-(--color-dark)">
            {BUSINESS.razonSocial} · RUC {BUSINESS.ruc}
          </p>
          <p className="text-sm text-(--color-dark)">{BUSINESS.address}</p>
          <p className="mt-3 flex items-center gap-2 text-sm" style={{ color: 'var(--color-accent)' }}>
            <Clock size={16} aria-hidden="true" />
            Plazo de respuesta: {RESPONSE_BUSINESS_DAYS} días hábiles.
          </p>
        </div>

        <div className="mt-8">
          <ComplaintForm />
        </div>

        <OtherContactMethods />
      </div>
    </main>
  );
}
