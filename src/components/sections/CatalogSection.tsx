import Image from "next/image";
import Link from "next/link";
import { categories } from "@/data/products";

// Mostrar máximo 4 categorías destacadas
const featuredCategories = categories.slice(0, 4);

export default function CatalogSection() {
  return (
    <section
      id="catalogo"
      className="scroll-mt-20 px-4 pt-8 pb-24 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-7xl space-y-10">
        <div className="space-y-4 text-center">
          <p
            className="text-sm font-semibold tracking-[0.2em] uppercase"
            style={{ color: "var(--color-accent)" }}
          >
            Explora nuestras colecciones
          </p>
          <div className="space-y-3">
            <h2
              className="text-4xl sm:text-5xl"
              style={{
                color: "var(--color-primary)",
                fontFamily: "var(--font-heading)",
              }}
            >
              Categorías Destacadas
            </h2>
            <p className="mx-auto max-w-2xl text-lg leading-8">
              Descubre nuestros arreglos florales pensados para cada momento especial
            </p>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {featuredCategories.map((category) => (
            <Link
              key={category.id}
              href={`/catalogo/${category.slug}`}
              className="group overflow-hidden rounded-[1.75rem] border transition-all duration-300 hover:-translate-y-1"
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
                    sizes="(max-width: 639px) 100vw, (max-width: 1279px) 50vw, 25vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span
                      className="text-4xl opacity-30"
                      style={{ color: "var(--color-secondary)" }}
                    >
                      🌸
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-2 px-6 py-6">
                <h3
                  className="text-xl"
                  style={{
                    color: "var(--color-dark)",
                    fontFamily: "var(--font-heading)",
                  }}
                >
                  {category.name}
                </h3>
                <p className="text-sm leading-6" style={{ color: "var(--color-dark)" }}>
                  {category.description}
                </p>
                {category.priceFrom !== undefined && (
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "var(--color-secondary)" }}
                  >
                    Desde S/{category.priceFrom.toFixed(2)}
                  </p>
                )}
                <p
                  className="text-xs font-semibold tracking-[0.15em] uppercase mt-3"
                  style={{ color: "var(--color-accent)" }}
                >
                  Ver productos →
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Botón Ver catálogo completo */}
        <div className="flex justify-center pt-8">
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-2 rounded-full px-10 py-4 text-base font-semibold tracking-[0.08em] uppercase transition-all duration-300 hover:opacity-90 hover:shadow-lg"
            style={{
              backgroundColor: "var(--color-primary)",
              color: "var(--color-cream)",
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
          </Link>
        </div>
      </div>
    </section>
  );
}
