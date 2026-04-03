import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCategories } from "@/features/catalog/queries/getCategories";
import { getProductsByCategory } from "@/features/catalog/queries/getProductsByCategory";
import ProductGrid from "@/features/catalog/components/ProductGrid";
import { BackButton } from "@/features/catalog/components/BackButton";
import Breadcrumb from "@/components/ui/Breadcrumb";

interface CategoriaPageProps {
  params: Promise<{ categoria: string }>;
}

export async function generateStaticParams(): Promise<{ categoria: string }[]> {
  try {
    const categories = await getCategories();
    return categories.map((category) => ({
      categoria: category.slug,
    }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: CategoriaPageProps): Promise<Metadata> {
  const { categoria } = await params;

  try {
    const categories = await getCategories();
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
  } catch {
    return {
      title: "Catalogo | Kataleya Flawers",
      description: "Arreglos florales premium en Lima.",
    };
  }
}

export default async function CategoriaPage({
  params,
}: CategoriaPageProps): Promise<React.ReactElement> {
  const { categoria } = await params;

  const categories = await getCategories();
  const category = categories.find((cat) => cat.slug === categoria);

  if (!category) {
    notFound();
  }

  const categoryProducts = await getProductsByCategory(categoria);

  return (
    <main className="min-h-screen bg-cream pt-28 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Breadcrumb items={[
          { label: 'Inicio', href: '/' },
          { label: 'Catálogo', href: '/catalogo' },
          { label: category.name },
        ]} />

        <div className="mb-8">
          <BackButton label="Volver al catálogo" href="/catalogo" />
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
