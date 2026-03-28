'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
            <Link
              key={product.id}
              href={`/catalogo/${categorySlug ?? ''}/${product.slug}`}
              className="group block rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
              style={{ backgroundColor: 'var(--color-white)' }}
            >
              <div
                className="relative aspect-[4/3] overflow-hidden"
                style={{ backgroundColor: 'var(--color-surface)' }}
              >
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-3 sm:p-6">
                <h2 className="font-heading text-sm sm:text-xl text-dark mb-1 sm:mb-2 group-hover:text-primary transition-colors leading-tight">
                  {product.name}
                </h2>
                <p className="font-body text-primary font-bold text-sm sm:text-lg">
                  {product.priceTable
                    ? `Desde S/ ${product.price}`
                    : `S/ ${product.price.toFixed(2)}`}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="font-body text-dark/60 text-lg">
            No hay productos disponibles en esta categoría.
          </p>
        </div>
      )}
    </div>
  );
}
