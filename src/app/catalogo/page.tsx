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
        <h1 className="font-heading text-4xl md:text-5xl text-primary text-center mb-12">
          Nuestro Catálogo
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/catalogo/${category.slug}`}
              className="group block rounded-lg p-8 transition-all duration-300 hover:shadow-lg"
              style={{ backgroundColor: "var(--color-white)", borderWidth: "1px", borderStyle: "solid", borderColor: "var(--color-border)" }}
            >
              <h2 className="font-heading text-2xl text-primary mb-3 group-hover:text-primary/80">
                {category.name}
              </h2>
              <p className="font-body text-dark/70 leading-relaxed">
                {category.description}
              </p>
              <div className="mt-6 flex items-center text-secondary font-body font-semibold">
                <span>Ver productos</span>
                <svg
                  className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1"
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
