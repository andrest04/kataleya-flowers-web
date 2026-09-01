import Link from 'next/link';

import HeroCanvasEditor from '@/features/admin/components/HeroCanvasEditor';
import { draftFromLive } from '@/features/admin/components/HeroCanvasEditor/mapDraft';
import { getAdminHeroSlides } from '@/features/admin/queries/heroSlides';
import {
  FALLBACK_HERO_SLIDE,
  getPublishedHeroSlide,
} from '@/features/landing/queries/getPublishedHeroSlide';

export const metadata = { title: 'Nuevo slide del hero' };

export default async function NuevoHeroSlidePage() {
  const [slides, liveHero] = await Promise.all([
    getAdminHeroSlides(),
    getPublishedHeroSlide(),
  ]);
  const allowHide = slides.some((slide) => slide.is_active);
  const initial = {
    ...draftFromLive(liveHero ?? FALLBACK_HERO_SLIDE),
    isActive: slides.length === 0,
  };

  return (
    <div className="space-y-6">
      <Link
        href="/admin/inicio"
        className="text-sm text-(--color-muted) transition-opacity hover:opacity-70"
      >
        ← Volver a inicio
      </Link>
      <h1 className="font-serif text-2xl font-semibold text-(--color-dark)">Nuevo slide</h1>
      <HeroCanvasEditor allowHide={allowHide} initial={initial} />
    </div>
  );
}
