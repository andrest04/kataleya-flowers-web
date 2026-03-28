import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { categories, products } from "@/data/products";
import ProductGrid from "@/features/catalog/components/ProductGrid";
import { BackButton } from "@/features/catalog/components/BackButton";

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
          <BackButton label="Volver al catálogo" />
        </div>

        <h1 className="font-heading text-4xl md:text-5xl text-primary mb-4">
          {category.name}
        </h1>
        <p className="font-body text-dark/70 text-lg mb-12 max-w-3xl">
          {category.description}
        </p>

        <ProductGrid initialProducts={categoryProducts} categorySlug={category.slug} />
      </div>
    </main>
  );
}
