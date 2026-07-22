import type { Category } from '@/features/catalog/types';

import CategoryTile from './CategoryTile';

interface CatalogSectionProps {
  categories: Category[];
}

export default function CatalogSection({ categories }: CatalogSectionProps) {
  const featured = categories.filter((category) => category.isFeatured);
  const rest = categories.filter((category) => !category.isFeatured);
  const tiles = [...featured, ...rest].slice(0, 6);

  if (tiles.length === 0) {
    return null;
  }

  return (
    <section id="catalogo" className="scroll-mt-20 py-16 sm:py-20">
      <div className="mx-auto max-w-[110rem] overflow-hidden px-4 sm:px-6 lg:px-8">
        <h2 className="font-heading text-3xl leading-tight text-(--color-dark) sm:text-4xl lg:text-5xl">
          Flores y regalos para cada ocasión
        </h2>

        <div
          className="scrollbar-hide mt-7 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-6 pr-4 sm:mt-8 sm:gap-5 sm:pb-7"
          role="region"
          aria-label="Catálogos de flores por ocasión"
        >
          {tiles.map((category) => (
            <CategoryTile
              key={category.id}
              category={category}
              layoutClasses="w-[70vw] shrink-0 snap-start sm:w-[42vw] lg:w-[18.5rem]"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
