import { MessageCircle } from 'lucide-react';
import Link from 'next/link';
import type { ReactElement } from 'react';

import Button from '@/components/ui/Button';
import type { Category } from '@/features/catalog/types';

interface SearchEmptyResultsProps {
  query: string;
  categories: Category[];
  matchedCategory: Category | null;
  hasActiveFilters: boolean;
  whatsappHref: string;
}

const linkClass =
  'inline-flex min-h-11 items-center font-body text-sm font-semibold text-(--color-dark) underline underline-offset-4 transition-colors hover:text-(--color-primary) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-primary)';

export default function SearchEmptyResults({
  query,
  categories,
  matchedCategory,
  hasActiveFilters,
  whatsappHref,
}: SearchEmptyResultsProps): ReactElement {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
      <p className="font-body text-base text-pretty text-(--color-dark)">
        No encontramos resultados para “{query}”. Prueba otra búsqueda o cuéntanos qué
        buscas y lo preparamos para ti.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
        <Button variant="whatsapp" size="md" href={whatsappHref} external>
          <MessageCircle className="size-5" aria-hidden="true" />
          Pedir por WhatsApp
        </Button>
        {matchedCategory && (
          <Link href={`/catalogo/${matchedCategory.slug}`} className={linkClass}>
            Ver {matchedCategory.name}
          </Link>
        )}
        {hasActiveFilters && (
          <Link href={`/buscar?q=${encodeURIComponent(query)}`} className={linkClass}>
            Quitar filtros
          </Link>
        )}
        <Link href="/catalogo" className={linkClass}>
          Ver catálogo
        </Link>
      </div>
      {categories.length > 0 && (
        <ul className="mt-8 flex flex-wrap justify-center gap-3" aria-label="Categorías">
          {categories.map((category) => (
            <li key={category.slug}>
              <Link
                href={`/catalogo/${category.slug}`}
                className="inline-flex min-h-11 items-center rounded-md border border-(--color-border) px-5 py-2.5 font-body text-sm text-(--color-dark) transition-colors hover:border-(--color-dark) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-primary)"
              >
                {category.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
