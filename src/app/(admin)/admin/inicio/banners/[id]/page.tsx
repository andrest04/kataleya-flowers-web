import Link from 'next/link';
import { notFound } from 'next/navigation';

import PromoBannerEditor from '@/features/admin/components/PromoBannerEditor';
import { draftFromBanner } from '@/features/admin/components/PromoBannerEditor/mapDraft';
import PromoBannerPairEditor from '@/features/admin/components/PromoBannerEditor/Pair';
import {
  getAdminPromoBannerById,
  getAdminPromoBanners,
  getAdminPromoPresetByBannerId,
} from '@/features/admin/queries/promoBanners';
import { getSiteSettings } from '@/features/settings/queries/getSiteSettings';
import { promoPresetKey } from '@/lib/promoPresetKey';
import { defaultWhatsappHref } from '@/lib/siteSettings';

interface EditarPromoBannerPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: EditarPromoBannerPageProps) {
  const { id } = await params;
  const banner = await getAdminPromoBannerById(id);
  return { title: banner ? `Editar ${banner.name || banner.title}` : 'Editar banners' };
}

export default async function EditarPromoBannerPage({ params }: EditarPromoBannerPageProps) {
  const { id } = await params;
  const [members, banners, settings] = await Promise.all([
    getAdminPromoPresetByBannerId(id),
    getAdminPromoBanners(),
    getSiteSettings(),
  ]);
  const whatsappHref = defaultWhatsappHref(settings);
  const banner = members.find((item) => item.id === id) ?? members[0];
  if (!banner) notFound();
  const allowHide = banners.some((item) => (
    item.is_active && promoPresetKey(item) !== promoPresetKey(banner)
  ));
  const sibling = members.find((item) => item.id !== banner.id);

  return (
    <div className="space-y-6">
      <Link
        href="/admin/inicio"
        className="text-sm text-(--color-muted) transition-opacity hover:opacity-70"
      >
        ← Volver a inicio
      </Link>
      <div>
        <h1 className="font-serif text-2xl font-semibold text-(--color-dark)">Editar banners</h1>
      </div>
      {sibling ? (
        <PromoBannerPairEditor
          allowHide={allowHide}
          bannerIds={[banner.id, sibling.id]}
          initials={[draftFromBanner(banner), draftFromBanner(sibling)]}
          showCancel
          whatsappHref={whatsappHref}
        />
      ) : (
        <PromoBannerEditor
          allowHide={allowHide}
          bannerId={banner.id}
          initial={draftFromBanner(banner)}
          whatsappHref={whatsappHref}
        />
      )}
    </div>
  );
}
