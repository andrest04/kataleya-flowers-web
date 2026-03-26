import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { categories, products } from "@/data/products";

interface CategoriaPageProps {
  params: Promise<{ categoria: string }>;
}

export async function generateStaticParams(): Promise<{ categoria: string }[]> {
  return categories.map((category) => ({
    categoria: category.slug,
  }));
}

export async function generateMetadata({
  params,
}: CategoriaPageProps): Promise<Metadata> {
  const { categoria } = await params;
  const category = categories.find((cat) => cat.slug === categoria);

  if (!category) {
    return {
      title: "Categoria no encontrada | Kataleya Flawers",
      description: "La categoria solicitada no existe en nuestro catalogo.",
    };
  }

  return {
    title: `${category.name} | Catalogo Kataleya Flawers`,
    description: category.description,
  };
}

export default async function CategoriaPage({
  params,
}: CategoriaPageProps): Promise<React.ReactElement> {
  const { categoria } = await params;

  const category = categories.find((cat) => cat.slug === categoria);

  if (!category) {
    notFound();
  }

  const categoryProducts = products.filter(
    (product) => product.categoryId === category.id,
  );

  return (
    <main className="min-h-screen bg-cream pt-28 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-2 text-sm font-body" style={{ color: "var(--color-muted)" }}>
            <li>
              <Link href="/" className="hover:text-primary transition-colors">
                Inicio
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link
                href="/catalogo"
                className="hover:text-primary transition-colors"
              >
                Catálogo
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-dark/70">
              {category.name}
            </li>
          </ol>
        </nav>

        <div className="mb-8">
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-body text-dark/70 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 shadow-sm"
              style={{ backgroundColor: "var(--color-white)", border: "1px solid color-mix(in srgb, var(--color-dark) 10%, transparent)" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Volver al catálogo
          </Link>
        </div>

        <h1 className="font-heading text-4xl md:text-5xl text-primary mb-4">
          {category.name}
        </h1>
        <p className="font-body text-dark/70 text-lg mb-12 max-w-3xl">
          {category.description}
        </p>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
          {categoryProducts.map((product) => (
            <Link
              key={product.id}
              href={`/catalogo/${category.slug}/${product.slug}`}
              className="group block rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
                style={{ backgroundColor: "var(--color-white)" }}
            >
              <div className="relative aspect-[4/3] overflow-hidden" style={{ backgroundColor: "var(--color-surface)" }}>
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

        {categoryProducts.length === 0 && (
          <div className="text-center py-16">
            <p className="font-body text-dark/60 text-lg">
              No hay productos disponibles en esta categoría.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
