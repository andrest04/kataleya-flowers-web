import Carousel from '@/components/ui/Carousel';
import type { Category } from '@/features/catalog/types';

import CategoryTile from './CategoryTile';

// Matches the heading's `mx-auto max-w-[110rem] px-4 sm:px-6 lg:px-8` inset so the
// first card lines up with the title even once the container starts centering above 110rem.
const HEADING_ALIGNED_LEFT_INSET =
  'pl-[max(1rem,calc((100vw_-_110rem)/2_+_1rem))] scroll-pl-[max(1rem,calc((100vw_-_110rem)/2_+_1rem))] ' +
  'sm:pl-[max(1.5rem,calc((100vw_-_110rem)/2_+_1.5rem))] sm:scroll-pl-[max(1.5rem,calc((100vw_-_110rem)/2_+_1.5rem))] ' +
  'lg:pl-[max(2rem,calc((100vw_-_110rem)/2_+_2rem))] lg:scroll-pl-[max(2rem,calc((100vw_-_110rem)/2_+_2rem))]';

interface CatalogSectionProps {
  categories: Category[];
  title: string;
}

export default function CatalogSection({ categories, title }: CatalogSectionProps) {
  const featured = categories.filter((category) => category.isFeatured);
  const rest = categories.filter((category) => !category.isFeatured);
  const tiles = [...featured, ...rest];

  if (tiles.length === 0) {
    return null;
  }

  return (
    <section id="catalogo" className="scroll-mt-20 overflow-x-hidden py-12 sm:py-16">
      <div className="mx-auto max-w-[110rem] px-4 sm:px-6 lg:px-8">
        <h2 className="font-heading text-3xl leading-tight text-balance text-(--color-primary) sm:text-4xl lg:text-5xl">
          {title}
        </h2>
      </div>

      <Carousel
        ariaLabel="Catálogos de flores por ocasión"
        leftInsetClassName={HEADING_ALIGNED_LEFT_INSET}
        fullBleed={false}
      >
        {tiles.map((category) => (
          <CategoryTile
            key={category.id}
            category={category}
            layoutClasses="w-[73vw] shrink-0 snap-start sm:w-[44vw] lg:w-[20rem]"
          />
        ))}
      </Carousel>
    </section>
  );
}
