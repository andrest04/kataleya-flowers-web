"use client";

import Link from "next/link";
import type { FormEvent, RefObject } from "react";

import type { SearchResult } from "./constants";
import { primaryLinks, secondaryLinks } from "./constants";
import DesktopSearch from "./DesktopSearch";

// Links inline del desktop. Se omite "Inicio" (#hero) porque el logo ya enlaza
// al home: tenerlo duplicado se ve amateur. Orden: Catálogo + secundarios.
const DESKTOP_LINKS = [...primaryLinks, ...secondaryLinks].filter(
  (link) => link.href !== "#hero",
);

const LINK_BASE =
  "group relative font-body text-[0.82rem] font-medium tracking-[0.06em] uppercase transition-colors duration-200";

interface DesktopNavProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  handleSearchSubmit: (e: FormEvent) => void;
  searchResults: SearchResult[];
  handleResultClick: (categorySlug: string, productSlug: string) => void;
  handleNavigate: (href: string) => void;
  isScrolled: boolean;
  /** True sobre el hero oscuro de la landing: links en crema. */
  overHero: boolean;
  desktopSearchRef: RefObject<HTMLDivElement | null>;
  clearSearch: () => void;
}

/**
 * Cluster de navegación desktop (≥ md): links de sección con subrayado animado,
 * buscador con autocomplete y CTA sólido. En mobile no se renderiza (`md:flex`);
 * ahí la navegación vive en `MobileDrawer`.
 */
export default function DesktopNav({
  searchQuery,
  setSearchQuery,
  handleSearchSubmit,
  searchResults,
  handleResultClick,
  handleNavigate,
  isScrolled,
  overHero,
  desktopSearchRef,
  clearSearch,
}: DesktopNavProps) {
  const linkClass = `${LINK_BASE} ${
    overHero
      ? "text-(--color-cream) hover:text-(--color-secondary)"
      : "text-(--color-dark) hover:text-(--color-primary)"
  }`;
  const underlineClass = `absolute -bottom-1 left-0 h-px w-0 transition-[width] duration-300 group-hover:w-full ${
    overHero ? "bg-(--color-secondary)" : "bg-(--color-primary)"
  }`;

  return (
    <div className="hidden items-center gap-7 md:flex">
      <nav aria-label="Secciones" className="flex items-center gap-7">
        {DESKTOP_LINKS.map((link) =>
          link.isRoute ? (
            <Link key={link.href} href={link.href} className={linkClass}>
              {link.label}
              <span className={underlineClass} />
            </Link>
          ) : (
            <button
              key={link.href}
              type="button"
              onClick={() => handleNavigate(link.href)}
              className={`cursor-pointer ${linkClass}`}
            >
              {link.label}
              <span className={underlineClass} />
            </button>
          ),
        )}
      </nav>

      <DesktopSearch
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSearchSubmit={handleSearchSubmit}
        searchResults={searchResults}
        handleResultClick={handleResultClick}
        isScrolled={isScrolled}
        overHero={overHero}
        desktopSearchRef={desktopSearchRef}
        clearSearch={clearSearch}
      />

      <button
        type="button"
        onClick={() => handleNavigate("#contacto")}
        className="cursor-pointer rounded-full bg-(--color-primary) px-6 py-3 font-body text-[0.78rem] font-semibold tracking-[0.08em] text-(--color-cream) uppercase transition-opacity duration-300 hover:opacity-90"
        style={{
          boxShadow:
            "0 10px 24px color-mix(in srgb, var(--color-primary) 32%, transparent)",
        }}
      >
        Hacer pedido
      </button>
    </div>
  );
}
