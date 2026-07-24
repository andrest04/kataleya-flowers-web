'use client';

import ProductCardComponent from '@/features/catalog/components/ProductCard';
import type { Category, Product } from '@/features/catalog/types';

interface CatalogResultsProps {
  products: Product[];
  categories: Category[];
  onClearAll: () => void;
}

export default function CatalogResults({
  products,
  categories,
  onClearAll,
}: CatalogResultsProps) {
  const empty = products.length === 0;

  return (
    <>
      <p
        role="status"
        aria-live="polite"
        className="font-body text-sm mb-4 text-(--color-muted)"
      >
        {empty
          ? 'No se encontraron productos con esos filtros.'
          : `${products.length} ${products.length === 1 ? 'producto encontrado' : 'productos encontrados'}`}
      </p>

      {!empty ? (
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
          {products.map((product) => {
            const category = categories.find((c) => c.id === product.categoryId);
            return (
              <ProductCardComponent
                key={product.id}
                product={product}
                categorySlug={category?.slug}
                categoryName={category?.name}
              />
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="font-heading text-2xl text-primary mb-2">Sin resultados</p>
          <p className="font-body text-sm mb-6 text-(--color-muted)">
            Prueba con otros filtros o explora el catálogo completo.
          </p>
          <button
            type="button"
            onClick={onClearAll}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-body text-sm font-medium transition-all bg-(--color-primary) text-(--color-white)"
          >
            Ver todo el catálogo
          </button>
        </div>
      )}
    </>
  );
}
