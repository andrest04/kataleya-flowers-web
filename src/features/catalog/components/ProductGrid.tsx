'use client';

import { useMemo, useState } from 'react';

import EmptyState from '@/components/ui/EmptyState';
import ProductCard from '@/features/catalog/components/ProductCard';
import type { Product } from '@/features/catalog/types';

interface ProductGridProps {
  initialProducts: Product[];
  categorySlug?: string;
}

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name-asc';

export default function ProductGrid({ initialProducts, categorySlug }: ProductGridProps) {
  const [sortOption, setSortOption] = useState<SortOption>('default');

  const sortedProducts = useMemo(() => {
    const copy = [...initialProducts];
    switch (sortOption) {
      case 'price-asc':
        return copy.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return copy.sort((a, b) => b.price - a.price);
      case 'name-asc':
        return copy.sort((a, b) => a.name.localeCompare(b.name, 'es'));
      default:
        return copy;
    }
  }, [initialProducts, sortOption]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="font-body text-sm" style={{ color: 'var(--color-muted)' }}>
          Mostrando {sortedProducts.length}{' '}
          {sortedProducts.length === 1 ? 'producto' : 'productos'}
        </p>
        <select
          aria-label="Ordenar productos"
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value as SortOption)}
          className="font-body text-sm rounded-lg px-3 py-2 outline-none cursor-pointer"
          style={{
            backgroundColor: 'var(--color-white)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-dark)',
          }}
        >
          <option value="default">Recomendados</option>
          <option value="price-asc">Precio: menor a mayor</option>
          <option value="price-desc">Precio: mayor a menor</option>
          <option value="name-asc">Nombre: A–Z</option>
        </select>
      </div>

      {sortedProducts.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
          {sortedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              categorySlug={categorySlug}
            />
          ))}
        </div>
      ) : (
        <EmptyState message="No hay productos disponibles en esta categoría." />
      )}
    </div>
  );
}
