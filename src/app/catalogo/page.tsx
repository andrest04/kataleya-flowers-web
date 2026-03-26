import Link from "next/link";
import React from "react";
import type { Metadata } from "next";
import { categories } from "@/data/products";

function Breadcrumb(): React.ReactElement {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex items-center gap-2 text-sm font-body" style={{ color: "var(--color-muted)" }}>
        <li>
          <Link href="/" className="hover:text-primary transition-colors">
            Inicio
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li aria-current="page" className="text-dark/70">
          Catálogo
        </li>
      </ol>
    </nav>
  );
}

export const metadata: Metadata = {
  title: "Catalogo de Flores | Kataleya Flawers",
  description:
    "Explora nuestro catalogo de arreglos florales, orquideas y regalos premium disponibles en Lima.",
};

export default function CatalogoPage(): React.ReactElement {
  return (
    <main className="min-h-screen bg-cream pt-28 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Breadcrumb />

        <div className="mb-8">
          <Link
            href="/"
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al inicio
          </Link>
        </div>

        <h1 className="font-heading text-4xl md:text-5xl text-primary text-center mb-12">
          Nuestro Catálogo
        </h1>

        <div className="grid grid-cols-2 gap-4 sm:gap-8">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/catalogo/${category.slug}`}
              className="group block rounded-lg p-4 sm:p-8 transition-all duration-300 hover:shadow-lg"
              style={{ backgroundColor: "var(--color-white)", borderWidth: "1px", borderStyle: "solid", borderColor: "var(--color-border)" }}
            >
              <h2 className="font-heading text-base sm:text-2xl text-primary mb-1 sm:mb-3 group-hover:text-primary/80 leading-tight">
                {category.name}
              </h2>
              <p className="hidden sm:block font-body text-dark/70 leading-relaxed">
                {category.description}
              </p>
              <div className="mt-3 sm:mt-6 flex items-center text-secondary font-body font-semibold text-sm sm:text-base">
                <span>Ver productos</span>
                <svg
                  className="ml-2 w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
