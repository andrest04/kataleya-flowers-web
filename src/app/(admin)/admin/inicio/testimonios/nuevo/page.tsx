import Link from 'next/link';

import TestimonialEditor from '@/features/admin/components/TestimonialEditor';
import { draftFromFallback } from '@/features/admin/components/TestimonialEditor/mapDraft';
import { getAdminTestimonials } from '@/features/admin/queries/testimonials';
import {
  FALLBACK_TESTIMONIALS,
  getPublishedTestimonials,
} from '@/features/landing/queries/getPublishedTestimonials';
import { HOME_TESTIMONIAL_LIMIT } from '@/lib/testimonialLimit';

export const metadata = { title: 'Nuevo testimonio' };

interface NuevoTestimonioPageProps {
  searchParams: Promise<{ from?: string }>;
}

export default async function NuevoTestimonioPage({ searchParams }: NuevoTestimonioPageProps) {
  const { from } = await searchParams;
  const [testimonials, liveTestimonials] = await Promise.all([
    getAdminTestimonials(),
    getPublishedTestimonials(),
  ]);
  const fromFallback = FALLBACK_TESTIMONIALS.find((item) => item.id === from);
  const source = fromFallback ?? liveTestimonials[0] ?? FALLBACK_TESTIMONIALS[0];
  const isEditingFallback = Boolean(fromFallback) && testimonials.length === 0;
  const initial = {
    ...draftFromFallback(source),
    isActive: isEditingFallback,
  };
  const activeCount = testimonials.length === 0
    ? FALLBACK_TESTIMONIALS.length
    : testimonials.filter((item) => item.is_active).length;
  const allowActivate = initial.isActive || activeCount < HOME_TESTIMONIAL_LIMIT;

  return (
    <div className="space-y-6">
      <Link
        href="/admin/inicio"
        className="text-sm text-(--color-muted) transition-opacity hover:opacity-70"
      >
        ← Volver a inicio
      </Link>
      <h1 className="font-serif text-2xl font-semibold text-(--color-dark)">
        {isEditingFallback ? 'Editar testimonio' : 'Nuevo testimonio'}
      </h1>
      <TestimonialEditor
        allowActivate={allowActivate}
        allowHide
        fromFallbackId={fromFallback?.id}
        initial={initial}
        showCancel
      />
    </div>
  );
}
