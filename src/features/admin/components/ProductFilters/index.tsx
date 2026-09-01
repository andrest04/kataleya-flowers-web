'use client';

import { Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useId, useState } from 'react';

import {
  type AdminProductQuery,
  serializeAdminProductQuery,
  updateAdminProductQuery,
} from '@/features/admin/utils/adminFilters';

import ProductFilterSelect from './ProductFilterSelect';

interface CategoryOption {
  name: string;
  slug: string;
}

interface ProductFiltersProps {
  categories: CategoryOption[];
  query: AdminProductQuery;
  resultCount: number;
}

const FIELD_CLASS =
  'h-11 w-full rounded-xl px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-primary)';

export default function ProductFilters({ categories, query, resultCount }: ProductFiltersProps) {
  const router = useRouter();
  const searchId = useId();
  const [searchDraft, setSearchDraft] = useState(query.search);
  const [previousSearch, setPreviousSearch] = useState(query.search);

  if (query.search !== previousSearch) {
    setPreviousSearch(query.search);
    setSearchDraft(query.search);
  }

  function navigate(update: Partial<AdminProductQuery>) {
    router.push(serializeAdminProductQuery(updateAdminProductQuery(query, update)));
  }

  const hasFilters =
    query.search !== '' || query.categorySlug !== null || query.status !== null || query.view !== 'all';

  return (
    <section
      aria-label="Filtros de productos"
      className="space-y-3 rounded-xl p-4"
      style={{ background: 'var(--color-white)', border: '1px solid var(--color-border)' }}
    >
      <div className="grid gap-3 md:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))]">
        <form
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            navigate({ search: searchDraft.trim() });
          }}
        >
          <label htmlFor={searchId} className="mb-1 block text-xs font-medium text-(--color-muted)">
            Buscar por nombre
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-(--color-muted)"
              aria-hidden="true"
              strokeWidth={1.8}
            />
            <input
              id={searchId}
              type="search"
              value={searchDraft}
              onChange={(event) => setSearchDraft(event.target.value)}
              placeholder="Ej. rosas rojas"
              className={`${FIELD_CLASS} pl-9`}
              style={{ border: '1px solid var(--color-border)' }}
            />
          </div>
        </form>

        <ProductFilterSelect
          label="Categoría"
          value={query.categorySlug ?? ''}
          onChange={(value) => navigate({ categorySlug: value || null })}
          className={FIELD_CLASS}
          options={[
            { label: 'Todas', value: '' },
            ...categories.map((category) => ({ label: category.name, value: category.slug })),
          ]}
        />

        <ProductFilterSelect
          label="Estado"
          value={query.status ?? ''}
          onChange={(value) => navigate({ status: value === 'active' || value === 'inactive' ? value : null })}
          className={FIELD_CLASS}
          options={[
            { label: 'Todos', value: '' },
            { label: 'Publicados', value: 'active' },
            { label: 'Ocultos', value: 'inactive' },
          ]}
        />

        <ProductFilterSelect
          label="Vista"
          value={query.view}
          onChange={(value) => navigate({ view: value === 'incomplete' ? 'incomplete' : 'all' })}
          className={FIELD_CLASS}
          options={[
            { label: 'Todos los productos', value: 'all' },
            { label: 'Les falta foto', value: 'incomplete' },
          ]}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p aria-live="polite" className="text-sm text-(--color-muted)">
          {resultCount} producto{resultCount !== 1 ? 's' : ''} encontrado{resultCount !== 1 ? 's' : ''}
        </p>
        {hasFilters ? (
          <button
            type="button"
            onClick={() => router.push('/admin/productos')}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-(--color-primary) transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-primary)"
          >
            <X className="size-3.5" aria-hidden="true" strokeWidth={2} />
            Limpiar filtros
          </button>
        ) : null}
      </div>
    </section>
  );
}
