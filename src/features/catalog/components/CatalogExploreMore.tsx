import { ArrowRight, MessageCircle } from 'lucide-react';
import Link from 'next/link';

import Button from '@/components/ui/Button';
import { catalogPillClass } from '@/features/catalog/components/catalogPill';
import type { Category } from '@/features/catalog/types';

interface CatalogExploreMoreProps {
  whatsappHref: string;
  relatedCategories: Category[];
  showCatalogLink: boolean;
}

export default function CatalogExploreMore({
  whatsappHref,
  relatedCategories,
  showCatalogLink,
}: CatalogExploreMoreProps) {
  const hasExploreLinks = showCatalogLink || relatedCategories.length > 0;

  return (
    <div className="mx-auto mt-16 flex max-w-3xl flex-col items-center gap-8 border-t border-(--color-border) pt-10 text-center">
      {hasExploreLinks && (
        <nav aria-label="Seguir explorando" className="flex flex-col items-center gap-4">
          <p className="font-heading text-2xl text-(--color-dark)">Sigue explorando</p>
          <ul className="flex flex-wrap justify-center gap-2">
            {showCatalogLink && (
              <li>
                <Link
                  href="/catalogo"
                  className={catalogPillClass('outline')}
                >
                  Ver todo el catálogo
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </li>
            )}
            {relatedCategories.map((category) => (
              <li key={category.id}>
                <Link
                  href={`/catalogo/${category.slug}`}
                  className={catalogPillClass()}
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
      <Button variant="whatsapp" size="md" href={whatsappHref} external>
        <MessageCircle className="size-5" aria-hidden="true" />
        Pedir por WhatsApp
      </Button>
    </div>
  );
}
