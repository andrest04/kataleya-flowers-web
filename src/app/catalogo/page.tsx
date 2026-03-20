import Link from 'next/link';
import React from 'react';
import { categories } from '@/data/products';

export default function CatalogoPage(): React.ReactElement {
  return (
    <main className="min-h-screen bg-cream pt-28 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="font-heading text-4xl md:text-5xl text-primary text-center mb-12">
          Nuestro Catálogo
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/catalogo/${category.slug}`}
              className="group block bg-white border border-gray-200 rounded-lg p-8 transition-all duration-300 hover:shadow-lg hover:border-primary/30"
            >
              <h2 className="font-heading text-2xl text-primary mb-3 group-hover:text-primary/80">
                {category.name}
              </h2>
              <p className="font-body text-dark/70 leading-relaxed">
                {category.description}
              </p>
              <div className="mt-6 flex items-center text-secondary font-body font-semibold">
                <span>Ver productos</span>
                <svg
                  className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1"
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
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
