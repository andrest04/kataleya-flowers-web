import Link from 'next/link';
import { notFound } from 'next/navigation';

import HeroCanvasEditor from '@/features/admin/components/HeroCanvasEditor';
import { draftFromSlide } from '@/features/admin/components/HeroCanvasEditor/mapDraft';
import { getAdminHeroSlideById, getAdminHeroSlides } from '@/features/admin/queries/heroSlides';

interface EditarHeroSlidePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: EditarHeroSlidePageProps) {
  const { id } = await params;
  const slide = await getAdminHeroSlideById(id);
  return { title: slide ? `Editar ${slide.title}` : 'Editar slide' };
}

export default async function EditarHeroSlidePage({ params }: EditarHeroSlidePageProps) {
  const { id } = await params;
  const [slide, slides] = await Promise.all([
    getAdminHeroSlideById(id),
    getAdminHeroSlides(),
  ]);
  if (!slide) notFound();
  const allowHide = slides.some((item) => item.is_active && item.id !== slide.id);

  return (
    <div className="space-y-6">
      <Link
        href="/admin/inicio"
        className="text-sm text-(--color-muted) transition-opacity hover:opacity-70"
      >
        ← Volver a inicio
      </Link>
      <div>
        <h1 className="font-serif text-2xl font-semibold text-(--color-dark)">Editar slide</h1>
      </div>
      <HeroCanvasEditor allowHide={allowHide} initial={draftFromSlide(slide)} slideId={slide.id} />
    </div>
  );
}
