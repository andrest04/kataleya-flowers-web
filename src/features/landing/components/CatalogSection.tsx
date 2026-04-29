import { Flower2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import Button from "@/components/ui/Button";
import SectionHeader from "@/components/ui/SectionHeader";
import type { Category } from "@/features/catalog/types";

interface CatalogSectionProps {
  categories: Category[];
}

export default function CatalogSection({ categories }: CatalogSectionProps) {
  const featuredCategories = categories.filter((category) => category.isFeatured).slice(0, 4);

  if (featuredCategories.length === 0) {
    return null;
  }

  return (
    <section
      id="catalogo"
      className="scroll-mt-20 px-4 pt-8 pb-24 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-7xl space-y-10">
        <SectionHeader
          subtitle="Explora nuestras colecciones"
          title="Categorías Destacadas"
          description="Descubre nuestros arreglos florales pensados para cada momento especial"
        />

        <div className="-mx-4 sm:mx-0 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 scrollbar-hide sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:pb-0 sm:px-0 lg:grid-cols-4">
          {featuredCategories.map((category) => (
            <Link
              key={category.id}
              href={`/catalogo/${category.slug}`}
              className="group shrink-0 w-[46vw] sm:w-auto cursor-pointer overflow-hidden rounded-[1.75rem] border transition-all duration-300 hover:-translate-y-1"
              style={{
                backgroundColor: "var(--color-cream)",
                borderColor:
                  "color-mix(in srgb, var(--color-secondary) 35%, transparent)",
                boxShadow:
                  "0 18px 50px color-mix(in srgb, var(--color-dark) 8%, transparent)",
              }}
            >
              <div
                className="relative aspect-[4/3]"
                style={{
                  backgroundColor:
                    "color-mix(in srgb, var(--color-secondary) 18%, var(--color-cream))",
                }}
              >
                {category.imageUrl ? (
                  <Image
                    src={category.imageUrl}
                    alt={category.name}
                    fill
                    sizes="(max-width: 639px) 46vw, (max-width: 1279px) 50vw, 25vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Flower2
                      className="h-10 w-10 opacity-30"
                      style={{ color: "var(--color-secondary)" }}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2 px-6 py-6">
                <h3 className="text-xl font-heading text-dark">
                  {category.name}
                </h3>
                <p className="hidden sm:block text-sm leading-6 text-dark">
                  {category.description}
                </p>
                {category.priceFrom !== undefined && (
                  <p className="text-sm font-semibold text-secondary">
                    Desde S/{category.priceFrom.toFixed(2)}
                  </p>
                )}
                <p className="text-xs font-semibold tracking-[0.15em] uppercase mt-3 text-accent">
                  Ver productos →
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Botón Ver catálogo completo */}
        <div className="flex justify-center pt-8">
          <Button
            variant="primary"
            size="lg"
            href="/catalogo"
            className="px-10 py-4 text-base hover:shadow-lg"
            style={{
              fontFamily: "var(--font-body)",
              boxShadow: "0 8px 24px color-mix(in srgb, var(--color-primary) 30%, transparent)",
            }}
          >
            Ver catálogo completo
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Button>
        </div>
      </div>
    </section>
  );
}
