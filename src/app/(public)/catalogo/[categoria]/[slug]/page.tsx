import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import React from "react";

import Breadcrumb from "@/components/ui/Breadcrumb";
import Carousel from "@/components/ui/Carousel";
import { JsonLd } from "@/components/ui/JsonLd";
import SectionHeader from "@/components/ui/SectionHeader";
import CatalogCollectionCard from "@/features/catalog/components/CatalogCollectionCard";
import { ProductGallery } from "@/features/catalog/components/ProductGallery";
import {
  PAGE_END_ID,
  ProductPurchasePanel,
} from "@/features/catalog/components/ProductPurchasePanel";
import { getCategories } from "@/features/catalog/queries/getCategories";
import { getProductBySlug } from "@/features/catalog/queries/getProductBySlug";
import { getProducts } from "@/features/catalog/queries/getProducts";
import { getProductsByCategory } from "@/features/catalog/queries/getProductsByCategory";
import { resolveProductRoute } from "@/features/catalog/queries/resolveProductRoute";
import { toCatalogCardProduct } from "@/features/catalog/utils/toCatalogCardProduct";
import { heroPositioningKicker } from "@/features/landing/rules/heroPositioning";
import { getSiteSettings } from "@/features/settings/queries/getSiteSettings";
import { BUSINESS } from "@/lib/constants";
import { ogImageUrl } from "@/lib/imageLoader";
import { truncateOnWord } from "@/lib/seoText";
import { floralArrangementsSeoDescription } from "@/lib/siteSettings";
import { buildProductJsonLd, productImageUrls } from "@/lib/structuredData";

export const revalidate = 3600;

const PRODUCT_SLUG_PATTERN = /^[a-z0-9-]{1,120}$/;
const OG_IMAGE_WIDTH = 1200;
const OG_IMAGE_HEIGHT = 630;
const OG_IMAGE_LIMIT = 3;

interface ProductoPageProps {
  params: Promise<{ categoria: string; slug: string }>;
}

async function findCanonicalProductPath(slug: string): Promise<string | null> {
  if (!PRODUCT_SLUG_PATTERN.test(slug)) return null;

  const [product, categories] = await Promise.all([
    getProductBySlug(slug),
    getCategories(),
  ]);
  if (!product) return null;

  const actualCategory = categories.find((category) => category.id === product.categoryId);
  return actualCategory ? `/catalogo/${actualCategory.slug}/${product.slug}` : null;
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
    const route = await resolveProductRoute(categoria, slug);

    if (!route) {
      return {
        title: "Producto no encontrado",
        description: "El producto solicitado no está disponible en el catálogo.",
      };
    }

    const { category, product } = route;
    const description = truncateOnWord(product.description, 160);
    const ogImages = productImageUrls(product)
      .slice(0, OG_IMAGE_LIMIT)
      .map((url) => ({
        url: ogImageUrl(url, OG_IMAGE_WIDTH, OG_IMAGE_HEIGHT),
        width: OG_IMAGE_WIDTH,
        height: OG_IMAGE_HEIGHT,
        alt: product.name,
      }));
    const titleBase = `${product.name} | Flores en ${BUSINESS.postalAddress.locality}`;
    const canonicalPath = `/catalogo/${category.slug}/${product.slug}`;

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
        images: ogImages,
      },
      twitter: {
        card: "summary_large_image",
        title: titleBase,
        description,
        images: ogImages.slice(0, 1),
      },
    };
  } catch {
    const settings = await getSiteSettings();
    return {
      title: "Producto no encontrado",
      description: floralArrangementsSeoDescription(settings.location),
    };
  }
}

export default async function ProductoPage({
  params,
}: ProductoPageProps): Promise<React.ReactElement> {
  const { categoria, slug } = await params;

  const [route, settings] = await Promise.all([
    resolveProductRoute(categoria, slug),
    getSiteSettings(),
  ]);

  if (!route) {
    const canonicalPath = await findCanonicalProductPath(slug);
    if (canonicalPath) {
      permanentRedirect(canonicalPath);
    }
    notFound();
  }

  const { category, product } = route;
  const relatedProducts = (await getProductsByCategory(category.slug))
    .filter((p) => p.id !== product.id)
    .slice(0, 8)
    .map(toCatalogCardProduct);

  const SITE_URL = settings.website;
  const productUrl = `${SITE_URL}/catalogo/${category.slug}/${product.slug}`;
  const productLd = buildProductJsonLd({
    categoryName: category.name,
    product,
    productUrl,
    settings,
  });

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
      className="min-h-screen bg-cream pt-10 px-4 pb-28 sm:px-6 lg:px-8 lg:pb-12"
    >
      <JsonLd data={[productLd, breadcrumbLd]} />
      <div className="max-w-8xl mx-auto">
        <Breadcrumb items={[
          { label: 'Inicio', href: '/' },
          { label: 'Catálogo', href: '/catalogo' },
          { label: category.name, href: `/catalogo/${category.slug}` },
          { label: product.name },
        ]} />

        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-8 lg:gap-x-12">
          <ProductGallery
            imageUrl={product.imageUrl}
            imageAlt={product.imageAlt}
            images={product.images}
            imageAlts={product.imageAlts}
            name={product.name}
          />

          <div className="min-w-0 lg:sticky lg:top-36 lg:self-start">
            <h1 className="font-heading font-normal text-3xl md:text-[2.3rem] text-primary mb-3">
              {product.name}
            </h1>
            <ProductPurchasePanel
              phone={settings.phone}
              proofLine={heroPositioningKicker(settings)}
              product={product}
              whatsappProductTemplate={settings.messages.whatsappProduct}
            />

            <div className="mt-8 max-w-prose">
              <h2 className="font-heading text-primary mb-3 text-2xl">Descripción</h2>
              <p className="font-body text-dark/80 leading-relaxed text-pretty">
                {product.description}
              </p>
              {product.includes && product.includes.length > 0 && (
                <p className="font-body text-dark/80 mt-3 leading-relaxed text-pretty">
                  <span className="text-dark font-semibold">Incluye: </span>
                  {product.includes.join(', ')}
                </p>
              )}
            </div>
          </div>
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
      <div id={PAGE_END_ID} aria-hidden="true" />
    </main>
  );
}
