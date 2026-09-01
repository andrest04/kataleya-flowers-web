import Link from 'next/link';
import { notFound } from 'next/navigation';

import TestimonialEditor from '@/features/admin/components/TestimonialEditor';
import { draftFromTestimonial } from '@/features/admin/components/TestimonialEditor/mapDraft';
import { getAdminTestimonialById, getAdminTestimonials } from '@/features/admin/queries/testimonials';
import { HOME_TESTIMONIAL_LIMIT } from '@/lib/testimonialLimit';

interface EditarTestimonioPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: EditarTestimonioPageProps) {
  const { id } = await params;
  const testimonial = await getAdminTestimonialById(id);
  return { title: testimonial ? `Editar ${testimonial.name}` : 'Editar testimonio' };
}

export default async function EditarTestimonioPage({ params }: EditarTestimonioPageProps) {
  const { id } = await params;
  const [testimonial, testimonials] = await Promise.all([
    getAdminTestimonialById(id),
    getAdminTestimonials(),
  ]);
  if (!testimonial) notFound();
  const activeCount = testimonials.filter((item) => item.is_active).length;
  const allowActivate = testimonial.is_active || activeCount < HOME_TESTIMONIAL_LIMIT;

  return (
    <div className="space-y-6">
      <Link
        href="/admin/inicio"
        className="text-sm text-(--color-muted) transition-opacity hover:opacity-70"
      >
        ← Volver a inicio
      </Link>
      <div>
        <h1 className="font-serif text-2xl font-semibold text-(--color-dark)">Editar testimonio</h1>
      </div>
      <TestimonialEditor
        allowActivate={allowActivate}
        allowHide
        initial={draftFromTestimonial(testimonial)}
        testimonialId={testimonial.id}
      />
    </div>
  );
}
