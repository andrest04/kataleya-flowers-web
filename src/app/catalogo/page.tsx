import Link from "next/link";
import Image from "next/image";
import React, { Suspense } from "react";
import type { Metadata } from "next";
import { categories, products } from "@/data/products";
import CatalogSearch from "@/components/catalog/CatalogSearch";

function Breadcrumb(): React.ReactElement {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex items-center gap-2 text-sm font-body" style={{ color: "var(--color-muted)" }}>
        <li>
          <Link href="/" className="hover:text-primary transition-colors">
            Inicio
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li aria-current="page" className="text-dark/70">
          Catálogo
        </li>
      </ol>
    </nav>
  );
}

// Static fallback: category grid rendered server-side while the client
// component loads (needed because CatalogSearch uses useSearchParams)
function CategoryGridFallback(): React.ReactElement {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/catalogo/${category.slug}`}
          className="group block rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
          style={{
            backgroundColor: "var(--color-white)",
            borderWidth: "1px",
            borderStyle: "solid",
            borderColor: "var(--color-border)",
          }}
        >
          <div className="relative aspect-[4/3] overflow-hidden">
            <Image
              src={category.imageUrl ?? "/placeholder-product.jpg"}
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
      ))}
    </div>
  );
}

export const metadata: Metadata = {
  title: "Catalogo de Flores | Kataleya Flawers",
  description:
    "Explora nuestro catalogo de arreglos florales, orquideas y regalos premium disponibles en Lima.",
};

export default function CatalogoPage(): React.ReactElement {
  return (
    <main className="min-h-screen bg-cream pt-28 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Breadcrumb />

        <h1 className="font-heading text-4xl md:text-5xl text-primary text-center mb-12">
          Nuestro Catálogo
        </h1>

        <Suspense fallback={<CategoryGridFallback />}>
          <CatalogSearch categories={categories} products={products} />
        </Suspense>
      </div>
    </main>
  );
}
