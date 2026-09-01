import Link from 'next/link';

import Button from '@/components/ui/Button';
import DiscoverTileList from '@/features/admin/components/DiscoverTileList';
import HeroCanvasEditor from '@/features/admin/components/HeroCanvasEditor';
import { draftFromLive } from '@/features/admin/components/HeroCanvasEditor/mapDraft';
import HeroSlideList from '@/features/admin/components/HeroSlideList';
import PromoBannerList from '@/features/admin/components/PromoBannerList';
import TestimonialList from '@/features/admin/components/TestimonialList';
import ValuePropList from '@/features/admin/components/ValuePropList';
import { getAdminDiscoverTiles } from '@/features/admin/queries/discoverTiles';
import { getAdminHeroSlides } from '@/features/admin/queries/heroSlides';
import { getAdminPromoBanners } from '@/features/admin/queries/promoBanners';
import { getAdminTestimonials } from '@/features/admin/queries/testimonials';
import { getAdminValueProps } from '@/features/admin/queries/valueProps';
import { FALLBACK_DISCOVER_TILES } from '@/features/landing/queries/getPublishedDiscoverTiles';
import {
  FALLBACK_HERO_SLIDE,
  getPublishedHeroSlide,
} from '@/features/landing/queries/getPublishedHeroSlide';
import { getPublishedPromoBanners } from '@/features/landing/queries/getPublishedPromoBanners';
import { FALLBACK_TESTIMONIALS } from '@/features/landing/queries/getPublishedTestimonials';
import { FALLBACK_VALUE_PROPS } from '@/features/landing/queries/getPublishedValueProps';

export const metadata = { title: 'Inicio' };

export default async function AdminInicioPage() {
  const [slides, liveHero, banners, liveBanners, testimonials, discoverTiles, valueProps] = await Promise.all([
    getAdminHeroSlides(),
    getPublishedHeroSlide(),
    getAdminPromoBanners(),
    getPublishedPromoBanners(),
    getAdminTestimonials(),
    getAdminDiscoverTiles(),
    getAdminValueProps(),
  ]);

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="font-serif text-2xl font-semibold text-(--color-dark)">Inicio</h1>
        <p className="text-xs text-(--color-muted)">
          ¿Quieres ver el sitio publicado?{' '}
          <Link href="/" className="underline underline-offset-4">Abrir el sitio</Link>
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
      </section>

      <section className="space-y-4" aria-labelledby="banners-heading">
        <div className="flex items-end justify-between gap-4">
          <h2 id="banners-heading" className="font-serif text-xl text-(--color-dark)">Banners</h2>
          <Button href="/admin/inicio/banners/nuevo" size="sm">Agregar banners</Button>
        </div>
        <PromoBannerList
          banners={banners}
          liveTitles={liveBanners.map((banner) => banner.heading)}
        />
      </section>

      <section className="space-y-4" aria-labelledby="testimonials-heading">
        <div className="flex items-end justify-between gap-4">
          <h2 id="testimonials-heading" className="font-serif text-xl text-(--color-dark)">Testimonios</h2>
          <Button href="/admin/inicio/testimonios/nuevo" size="sm">Agregar testimonio</Button>
        </div>
        <TestimonialList
          items={testimonials}
          liveItems={FALLBACK_TESTIMONIALS.map((item) => ({
            id: item.id,
            name: item.name,
            occasion: item.occasion,
          }))}
        />
      </section>

      <section className="space-y-4" aria-labelledby="discover-heading">
        <div className="flex items-end justify-between gap-4">
          <h2 id="discover-heading" className="font-serif text-xl text-(--color-dark)">Descubre Kataleya</h2>
          <Button href="/admin/inicio/descubrir/nuevo" size="sm">Agregar tarjeta</Button>
        </div>
        <DiscoverTileList
          items={discoverTiles}
          liveItems={FALLBACK_DISCOVER_TILES.map((item) => ({
            description: item.description,
            id: item.id,
            title: item.title,
          }))}
        />
      </section>

      <section className="space-y-4" aria-labelledby="value-props-heading">
        <div className="flex items-end justify-between gap-4">
          <h2 id="value-props-heading" className="font-serif text-xl text-(--color-dark)">Destacados</h2>
          <Button href="/admin/inicio/destacados/nuevo" size="sm">Agregar destacado</Button>
        </div>
        <ValuePropList
          items={valueProps}
          liveItems={FALLBACK_VALUE_PROPS.map((item) => ({
            description: item.description,
            id: item.id,
            title: item.title,
          }))}
        />
      </section>
    </div>
  );
}
