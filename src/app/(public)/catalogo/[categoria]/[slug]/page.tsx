import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCategories } from "@/features/catalog/queries/getCategories";
import { getProducts } from "@/features/catalog/queries/getProducts";
import { getProductBySlug } from "@/features/catalog/queries/getProductBySlug";
import { BUSINESS } from "@/lib/constants";
import { ProductGallery } from "@/features/catalog/components/ProductGallery";
import { BackButton } from "@/features/catalog/components/BackButton";
import Breadcrumb from "@/components/ui/Breadcrumb";
import TrackProductView from "@/features/analytics/components/TrackProductView";
import WhatsAppProductButton from "@/features/analytics/components/WhatsAppProductButton";

interface ProductoPageProps {
  params: Promise<{ categoria: string; slug: string }>;
}

export async function generateStaticParams(): Promise<
  { categoria: string; slug: string }[]
> {
  try {
    const [categories, products] = await Promise.all([
      getCategories(),
      getProducts(),
    ]);

    const categoryMap = new Map(categories.map((cat) => [cat.id, cat]));
    const params: { categoria: string; slug: string }[] = [];

    for (const product of products) {
      const category = categoryMap.get(product.categoryId);
      if (category) {
        params.push({
          categoria: category.slug,
          slug: product.slug,
        });
      }
    }

    return params;
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: ProductoPageProps): Promise<Metadata> {
  const { categoria, slug } = await params;

  try {
    const [product, categories] = await Promise.all([
      getProductBySlug(slug),
      getCategories(),
    ]);

    if (!product) {
      return {
        title: "Producto no encontrado | Kataleya Flawers",
        description: "El producto solicitado no esta disponible en el catalogo.",
      };
    }

    const category = categories.find(
      (cat) => cat.slug === categoria && cat.id === product.categoryId
    );

    if (!category) {
      return {
        title: `${product.name} | Kataleya Flawers`,
        description: product.description,
      };
    }

    return {
      title: `${product.name} | ${category.name} | Kataleya Flawers`,
      description: product.description,
    };
  } catch {
    return {
      title: "Kataleya Flawers",
      description: "Arreglos florales premium en Lima.",
    };
  }
}

export default async function ProductoPage({
  params,
}: ProductoPageProps): Promise<React.ReactElement> {
  const { categoria, slug } = await params;

  const [product, categories] = await Promise.all([
    getProductBySlug(slug),
    getCategories(),
  ]);

  if (!product) {
    notFound();
  }

  const category = categories.find(
    (cat) => cat.slug === categoria && cat.id === product.categoryId
  );

  if (!category) {
    notFound();
  }

  const whatsappUrl = BUSINESS.whatsappWithMessage(
    `Hola, me interesa el producto: ${product.name}`
  );

  return (
    <main className="min-h-screen bg-cream pt-28 pb-12 px-4 sm:px-6 lg:px-8">
      <TrackProductView productId={product.id} productSlug={product.slug} />
      <div className="max-w-7xl mx-auto">
        <Breadcrumb items={[
          { label: 'Inicio', href: '/' },
          { label: 'Catálogo', href: '/catalogo' },
          { label: category.name, href: `/catalogo/${category.slug}` },
          { label: product.name },
        ]} />

        <div className="mb-8">
          <BackButton label={`Volver a ${category.name}`} href={`/catalogo/${category.slug}`} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Imagen / galería del producto */}
          <ProductGallery
            imageUrl={product.imageUrl}
            images={product.images}
            name={product.name}
          />

          {/* Información del producto */}
          <div className="flex flex-col">
            <h1 className="font-heading text-3xl md:text-4xl text-primary mb-4">
              {product.name}
            </h1>

            {product.priceTable ? (
              <div className="mb-6">
                <p className="font-body text-primary font-bold text-2xl mb-3">
                  Desde S/ {product.price}
                </p>
                <table className="w-full text-sm font-body border-collapse">
                  <thead>
                    <tr style={{ backgroundColor: 'var(--color-surface)' }}>
                      <th className="text-left p-2 border font-semibold" style={{ borderColor: 'var(--color-border)' }}>
                        Cantidad
                      </th>
                      <th className="text-right p-2 border font-semibold" style={{ borderColor: 'var(--color-border)' }}>
                        Precio
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.priceTable.map((v) => (
                      <tr key={v.label}>
                        <td className="p-2 border" style={{ borderColor: 'var(--color-border)' }}>
                          {v.label}
                        </td>
                        <td className="p-2 border text-right font-semibold text-primary" style={{ borderColor: 'var(--color-border)' }}>
                          S/ {v.price}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {product.note && (
                  <p className="mt-2 text-sm font-body font-semibold" style={{ color: 'var(--color-secondary)' }}>
                    {product.note}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-2xl font-body text-primary font-bold mb-6">
                S/ {product.price.toFixed(2)}
              </p>
            )}

            <div className="prose prose-lg mb-8">
              <p className="font-body text-dark/80 leading-relaxed">
                {product.description}
              </p>
            </div>

            <div className="mt-auto pt-8 border-t" style={{ borderColor: "var(--color-border)" }}>
              <WhatsAppProductButton href={whatsappUrl} productSlug={product.slug} />

              <p className="mt-4 font-body text-dark/50 text-sm">
                Te responderemos a la brevedad con disponibilidad y opciones de
                entrega.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
