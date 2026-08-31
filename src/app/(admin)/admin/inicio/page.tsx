import Link from 'next/link';

import Button from '@/components/ui/Button';
import HeroCanvasEditor from '@/features/admin/components/HeroCanvasEditor';
import { draftFromLive } from '@/features/admin/components/HeroCanvasEditor/mapDraft';
import HeroSlideList from '@/features/admin/components/HeroSlideList';
import { getAdminHeroSlides } from '@/features/admin/queries/heroSlides';
import {
  FALLBACK_HERO_SLIDE,
  getPublishedHeroSlide,
} from '@/features/landing/queries/getPublishedHeroSlide';

export const metadata = { title: 'Inicio' };

export default async function AdminInicioPage() {
  const [slides, liveHero] = await Promise.all([
    getAdminHeroSlides(),
    getPublishedHeroSlide(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-(--color-dark)">Inicio</h1>
        <p className="mt-1 text-sm text-(--color-muted)">
          El que está prendido es el de la portada.
        </p>
      </div>

      <section className="space-y-4" aria-labelledby="hero-heading">
        {slides.length === 0 ? (
          <HeroCanvasEditor
            allowHide={false}
            initial={draftFromLive(liveHero ?? FALLBACK_HERO_SLIDE)}
            showCancel={false}
            heading={(
              <h2 id="hero-heading" className="font-serif text-xl text-(--color-dark)">Hero</h2>
            )}
          />
        ) : (
          <>
            <div className="flex items-end justify-between gap-4">
              <h2 id="hero-heading" className="font-serif text-xl text-(--color-dark)">Hero</h2>
              <Button href="/admin/inicio/hero/nuevo" size="sm">Agregar slide</Button>
            </div>
            <HeroSlideList slides={slides} />
          </>
        )}
        <p className="text-xs text-(--color-muted)">
          ¿Quieres ver el sitio publicado?{' '}
          <Link href="/" className="underline underline-offset-4">Abrir el sitio</Link>
        </p>
      </section>
    </div>
  );
}
