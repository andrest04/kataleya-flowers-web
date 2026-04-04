'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Category } from '@/features/catalog/types';
import { clientTrackEvent } from '@/features/analytics/lib/clientTrack';

interface CategoryCardProps {
  category: Category;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  const handleClick = () => {
    clientTrackEvent({
      eventType: 'category_click',
      entityType: 'category',
      entityId: category.id,
      entitySlug: category.slug,
    });
  };

  return (
    <Link
      href={`/catalogo/${category.slug}`}
      onClick={handleClick}
      className="group block rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
      style={{
        backgroundColor: 'var(--color-white)',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'var(--color-border)',
      }}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={category.imageUrl ?? '/placeholder-product.jpg'}
          alt={category.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, 33vw"
        />
      </div>
      <div className="p-4 sm:p-6">
        <h2 className="font-heading text-base sm:text-xl text-primary mb-1 sm:mb-2 group-hover:text-primary/80 leading-tight">
          {category.name}
        </h2>
        <p className="hidden sm:block font-body text-sm text-dark/70 leading-relaxed mb-3">
          {category.description}
        </p>
        <div className="flex items-center text-secondary font-body font-semibold text-sm">
          <span>Ver productos</span>
          <svg
            className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </Link>
  );
}
