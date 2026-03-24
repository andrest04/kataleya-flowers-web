import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { categories, products } from "@/data/products";
import { BUSINESS } from "@/lib/constants";
import { ProductGallery } from "@/components/catalog/ProductGallery";

interface ProductoPageProps {
  params: Promise<{ categoria: string; slug: string }>;
}

export async function generateStaticParams(): Promise<
  { categoria: string; slug: string }[]
> {
  const params: { categoria: string; slug: string }[] = [];

  for (const product of products) {
    const category = categories.find((cat) => cat.id === product.categoryId);
    if (category) {
      params.push({
        categoria: category.slug,
        slug: product.slug,
      });
    }
  }

  return params;
}

export async function generateMetadata({
  params,
}: ProductoPageProps): Promise<Metadata> {
  const { categoria, slug } = await params;
  const product = products.find((p) => p.slug === slug);

  if (!product) {
    return {
      title: "Producto no encontrado | Kataleya Flawers",
      description: "El producto solicitado no esta disponible en el catalogo.",
    };
  }

  const category = categories.find(
    (cat) => cat.slug === categoria && cat.id === product.categoryId,
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
}

export default async function ProductoPage({
  params,
}: ProductoPageProps): Promise<React.ReactElement> {
  const { categoria, slug } = await params;

  const product = products.find((p) => p.slug === slug);

  if (!product) {
    notFound();
  }

  const category = categories.find(
    (cat) => cat.slug === categoria && cat.id === product.categoryId,
  );

  if (!category) {
    notFound();
  }

  const whatsappUrl = BUSINESS.whatsappWithMessage(
    `Hola, me interesa el producto: ${product.name}`,
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
            <li>
              <Link
                href={`/catalogo/${category.slug}`}
                className="hover:text-primary transition-colors"
              >
                {category.name}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-dark/70">
              {product.name}
            </li>
          </ol>
        </nav>

        <div className="mb-8">
          <Link
            href={`/catalogo/${category.slug}`}
            prefetch={false}
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
            Volver a {category.name}
          </Link>
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
            <h1 className="font-display text-3xl md:text-4xl text-primary mb-4">
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
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center bg-accent text-cream font-body font-bold py-3 px-8 rounded-md hover:opacity-90 transition-opacity"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Consultar por WhatsApp
              </a>

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
