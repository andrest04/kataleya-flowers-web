import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import SectionHeader from '@/components/ui/SectionHeader';
import type { Category } from '@/features/catalog/types';

import CategoryTile from './CategoryTile';
import { getLayout } from './gridLayout';

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

  const layout = getLayout(tiles.length);

  const isSparseLayout = tiles.length <= 2;

  const sparseCols =
    tiles.length === 1 ? 'max-w-2xl sm:grid-cols-1' : 'max-w-3xl sm:grid-cols-2';
  const gridContainerClass = isSparseLayout
    ? `mx-auto grid grid-cols-1 gap-x-4 gap-y-8 ${sparseCols}`
    : `-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 scrollbar-hide sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-x-4 sm:gap-y-8 sm:overflow-visible sm:px-0 sm:pb-0 ${layout.grid}`;

  const carouselTileClasses = 'w-[72vw] shrink-0 snap-start sm:w-auto';
  const sparseTileClasses = 'w-full';

  return (
    <section id="catalogo" className="scroll-mt-20 px-4 pt-8 pb-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-10">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <SectionHeader
            align="left"
            subtitle="Nuestras colecciones"
            title="Flores para cada momento"
          />
          <Link
            href="/catalogo"
            className="group inline-flex items-center gap-2 pb-1 text-sm font-semibold tracking-wide text-(--color-primary) transition-colors hover:text-(--color-accent) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--color-secondary)"
          >
            Ver catálogo completo
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div
          className={gridContainerClass}
          {...(!isSparseLayout && {
            role: 'region',
            'aria-label': 'Colecciones de flores',
          })}
        >
          {tiles.map((category, index) => (
            <CategoryTile
              key={category.id}
              category={category}
              layoutClasses={
                isSparseLayout
                  ? sparseTileClasses
                  : `${carouselTileClasses} ${layout.tiles[index] ?? ''}`
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
}
