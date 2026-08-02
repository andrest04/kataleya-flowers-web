import type { Metadata } from "next";
import { notFound } from "next/navigation";
import React from "react";

import Breadcrumb from "@/components/ui/Breadcrumb";
import Button from "@/components/ui/Button";
import { JsonLd } from "@/components/ui/JsonLd";
import { BackButton } from "@/features/catalog/components/BackButton";
import { ProductGallery } from "@/features/catalog/components/ProductGallery";
import { getCategories } from "@/features/catalog/queries/getCategories";
import { getProductBySlug } from "@/features/catalog/queries/getProductBySlug";
import { getProducts } from "@/features/catalog/queries/getProducts";
import { BUSINESS } from "@/lib/constants";

const SITE_URL = BUSINESS.website;

export const revalidate = 3600;

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
        title: "Producto no encontrado",
        description: "El producto solicitado no está disponible en el catálogo.",
      };
    }

    const category = categories.find(
      (cat) => cat.slug === categoria && cat.id === product.categoryId
    );

    const description = product.description.slice(0, 160);
    const productImages =
      product.images && product.images.length > 0
        ? product.images
        : [product.imageUrl];
    const titleBase = category
      ? `${product.name} | ${category.name}`
      : product.name;
    const canonicalPath = category
      ? `/catalogo/${category.slug}/${product.slug}`
      : `/catalogo/${categoria}/${slug}`;

    return {
      title: titleBase,
      description,
      alternates: {
        canonical: canonicalPath,
      },
      openGraph: {
        title: titleBase,
        description,
        type: "website",
        url: canonicalPath,
        images: productImages,
      },
      twitter: {
        card: "summary_large_image",
        title: titleBase,
        description,
        images: [productImages[0]],
      },
    };
  } catch {
    return {
      title: BUSINESS.name,
      description: `Arreglos florales premium en ${BUSINESS.location}.`,
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
    BUSINESS.messages.whatsappProduct(product.name)
  );

  const productUrl = `${SITE_URL}/catalogo/${category.slug}/${product.slug}`;
  const productImages =
    product.images && product.images.length > 0
      ? product.images
      : [product.imageUrl];

  const offers =
    product.priceTable && product.priceTable.length > 0
      ? {
          "@type": "AggregateOffer",
          priceCurrency: "PEN",
          lowPrice: Math.min(...product.priceTable.map((v) => v.price)),
          highPrice: Math.max(...product.priceTable.map((v) => v.price)),
          offerCount: product.priceTable.length,
          availability: "https://schema.org/InStock",
          url: productUrl,
        }
      : {
          "@type": "Offer",
          priceCurrency: "PEN",
          price: product.price,
          availability: "https://schema.org/InStock",
          url: productUrl,
        };

  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: productImages,
    brand: {
      "@type": "Brand",
      name: BUSINESS.name,
    },
    category: category.name,
    offers,
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Inicio",
        item: `${SITE_URL}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Catálogo",
        item: `${SITE_URL}/catalogo`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: category.name,
        item: `${SITE_URL}/catalogo/${category.slug}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: product.name,
        item: productUrl,
      },
    ],
  };

  return (
    <main
      id="main-content"
      className="min-h-screen bg-cream pt-28 pb-12 px-4 sm:px-6 lg:px-8"
    >
      <JsonLd data={[productLd, breadcrumbLd]} />
      <div className="max-w-8xl mx-auto">
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
          <ProductGallery
            imageUrl={product.imageUrl}
            images={product.images}
            name={product.name}
          />

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
              <Button
                variant="whatsapp"
                size="md"
                href={whatsappUrl}
                external
                className="font-body font-bold py-3 px-8 rounded-md"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Consultar por WhatsApp
              </Button>

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
