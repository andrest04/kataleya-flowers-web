import type { Metadata } from "next";
import { notFound } from "next/navigation";
import React from "react";

import Breadcrumb from "@/components/ui/Breadcrumb";
import Carousel from "@/components/ui/Carousel";
import { JsonLd } from "@/components/ui/JsonLd";
import SectionHeader from "@/components/ui/SectionHeader";
import CatalogCollectionCard from "@/features/catalog/components/CatalogCollectionCard";
import { ProductGallery } from "@/features/catalog/components/ProductGallery";
import { ProductPurchasePanel } from "@/features/catalog/components/ProductPurchasePanel";
import { getCategories } from "@/features/catalog/queries/getCategories";
import { getProductBySlug } from "@/features/catalog/queries/getProductBySlug";
import { getProducts } from "@/features/catalog/queries/getProducts";
import { getProductsByCategory } from "@/features/catalog/queries/getProductsByCategory";
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

  const relatedProducts = (await getProductsByCategory(category.slug))
    .filter((p) => p.id !== product.id)
    .slice(0, 8);

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
      className="min-h-screen bg-cream pt-10 pb-12 px-4 sm:px-6 lg:px-8"
    >
      <JsonLd data={[productLd, breadcrumbLd]} />
      <div className="max-w-8xl mx-auto">
        <Breadcrumb items={[
          { label: 'Inicio', href: '/' },
          { label: 'Catálogo', href: '/catalogo' },
          { label: category.name, href: `/catalogo/${category.slug}` },
          { label: product.name },
        ]} />

        <div className="grid grid-cols-1 lg:grid-cols-[4fr_3fr] gap-8 lg:gap-x-[5%]">
          <ProductGallery
            imageUrl={product.imageUrl}
            images={product.images}
            name={product.name}
          />

          <div className="lg:sticky lg:top-36 lg:self-start">
            <h1 className="font-heading font-normal text-3xl md:text-[2.3rem] text-primary mb-3">
              {product.name}
            </h1>
            <ProductPurchasePanel product={product} />
          </div>
        </div>

        <div className="max-w-2xl mt-12 lg:mt-16">
          <h2 className="font-heading text-2xl text-primary mb-3">Descripción</h2>
          <p className="font-body text-dark/80 leading-relaxed">{product.description}</p>
          {product.includes && product.includes.length > 0 && (
            <p className="font-body text-dark/80 leading-relaxed mt-3">
              <span className="font-semibold text-dark">Incluye: </span>
              {product.includes.join(', ')}
            </p>
          )}
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-16 lg:mt-24 overflow-x-hidden">
            <div className="ml-[calc(50%-50vw)] w-screen border-t border-(--color-primary)" />
            <div className="pt-16 lg:pt-24">
              <SectionHeader
                title="También te puede gustar"
                align="left"
                as="h2"
              />
              <Carousel ariaLabel="También te puede gustar">
                {relatedProducts.map((related) => (
                  <div
                    key={related.id}
                    className="w-[73vw] shrink-0 snap-start sm:w-[44vw] lg:w-[20rem]"
                  >
                    <CatalogCollectionCard product={related} categorySlug={category.slug} />
                  </div>
                ))}
              </Carousel>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
