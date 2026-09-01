import Link from 'next/link';

import { draftFromFallback } from '@/features/admin/components/PromoBannerEditor/mapDraft';
import PromoBannerPairEditor from '@/features/admin/components/PromoBannerEditor/Pair';
import { getAdminPromoBanners } from '@/features/admin/queries/promoBanners';
import {
  FALLBACK_PROMO_BANNERS,
  getPublishedPromoBanners,
} from '@/features/landing/queries/getPublishedPromoBanners';

export const metadata = { title: 'Nuevos banners' };

export default async function NuevoPromoBannerPage() {
  const [banners, liveBanners] = await Promise.all([
    getAdminPromoBanners(),
    getPublishedPromoBanners(),
  ]);
  const allowHide = banners.some((banner) => banner.is_active);
  const first = draftFromFallback(liveBanners[0] ?? FALLBACK_PROMO_BANNERS[0]);
  const second = draftFromFallback(liveBanners[1] ?? FALLBACK_PROMO_BANNERS[1]);
  const isActive = banners.length === 0;

  return (
    <div className="space-y-6">
      <Link
        href="/admin/inicio"
        className="text-sm text-(--color-muted) transition-opacity hover:opacity-70"
      >
        ← Volver a inicio
      </Link>
      <h1 className="font-serif text-2xl font-semibold text-(--color-dark)">Nuevos banners</h1>
      <PromoBannerPairEditor
        allowHide={allowHide}
        showCancel
        initials={[
          { ...first, isActive, name: '' },
          { ...second, isActive, name: '' },
        ]}
      />
    </div>
  );
}
