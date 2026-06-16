import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import SectionHeader from '@/components/ui/SectionHeader';
import type { Category } from '@/features/catalog/types';

import CategoryTile from './CategoryTile';
import { getLayout, getTileVariant } from './gridLayout';

interface CatalogSectionProps {
  categories: Category[];
}

export default function CatalogSection({ categories }: CatalogSectionProps) {
  // Featured first (admin-controlled prominence: index 0 takes the hero tile),
  // then the rest, capped at 6 tiles.
  const featured = categories.filter((category) => category.isFeatured);
  const rest = categories.filter((category) => !category.isFeatured);
  const tiles = [...featured, ...rest].slice(0, 6);

  if (tiles.length === 0) {
    return null;
  }

  const layout = getLayout(tiles.length);

  // ≤2 tiles: skip the snap-carousel (no real overflow — dead swipe on mobile)
  // and render a centered, max-width-contained grid instead of full-bleed bento.
  const isSparseLayout = tiles.length <= 2;

  // Sparse fallback classes: 1 tile → single centered column; 2 tiles → two equal columns.
  // Literals required so Tailwind's static extractor picks them up.
  const sparseCols =
    tiles.length === 1 ? 'max-w-2xl sm:grid-cols-1' : 'max-w-3xl sm:grid-cols-2';
  const gridContainerClass = isSparseLayout
    ? // Centered fallback: fixed aspect tiles in a contained, symmetric grid.
      // No snap/overflow so there is no dead swipe; no full-bleed stretch on desktop.
      `mx-auto grid grid-cols-1 gap-4 ${sparseCols}`
    : // Standard bento + mobile snap-carousel for 3–6 tiles.
      `-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-4 scrollbar-hide sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0 ${layout.grid}`;

  // Layout-context classes for each tile. The carousel/bento variant sizes tiles for
  // the mobile snap rail and lets the bento row spans drive height on lg; the sparse
  // variant keeps an explicit aspect at every breakpoint (no spans to give it height).
  const carouselTileClasses =
    'aspect-[3/4] w-[72vw] shrink-0 snap-start sm:aspect-[4/3] sm:w-auto lg:aspect-auto';
  const sparseTileClasses = 'aspect-[3/4] w-full sm:aspect-[4/3]';

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
          // The snap rail is an implicit scroll region on mobile; name it for SRs.
          {...(!isSparseLayout && {
            role: 'region',
            'aria-label': 'Colecciones de flores',
          })}
        >
          {tiles.map((category, index) => (
            <CategoryTile
              key={category.id}
              category={category}
              variant={getTileVariant(tiles.length, index)}
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
