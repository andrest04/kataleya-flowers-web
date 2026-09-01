import { getPublishedPromoBanners } from '@/features/landing/queries/getPublishedPromoBanners';

import PromoBannerCard from './PromoBannerCard';

export default async function PromoBanners() {
  const banners = await getPublishedPromoBanners();
  if (banners.length === 0) return null;

  return (
    <section className="px-4 py-12 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[110rem]">
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
          {banners.map((banner) => (
            <PromoBannerCard
              key={banner.id}
              contentPosition={banner.contentPosition}
              cta={banner.cta}
              description={banner.description}
              heading={banner.heading}
              imageSrc={banner.imageSrc}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
