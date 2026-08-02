"use client";

import { ChevronRight, Search } from "lucide-react";
import Link from "next/link";
import type { FormEvent, RefObject } from "react";

import SearchResultItem from "@/components/shared/SearchResultItem";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/primitives/sheet";
import { BUSINESS } from "@/lib/constants";

import type { SearchResult } from "./constants";
import { primaryLinks, secondaryLinks } from "./constants";

interface MobileDrawerProps {
  isDrawerOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  handleSearchSubmit: (e: FormEvent) => void;
  searchResults: SearchResult[];
  handleResultClick: (categorySlug: string, productSlug: string) => void;
  handleNavigate: (href: string) => void;
  searchInputRef: RefObject<HTMLInputElement | null>;
  clearSearch: () => void;
}

export default function MobileDrawer({
  isDrawerOpen,
  onClose,
  searchQuery,
  setSearchQuery,
  handleSearchSubmit,
  searchResults,
  handleResultClick,
  handleNavigate,
  searchInputRef,
  clearSearch,
}: MobileDrawerProps) {
  return (
    <Sheet
      open={isDrawerOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <SheetContent
        side="left"
        className="z-[95] flex w-72 max-w-[85vw] flex-col overflow-y-auto p-0"
        aria-label="Menú de navegación"
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <SheetTitle className="text-lg text-primary font-heading">
            {BUSINESS.name}
          </SheetTitle>
          <SheetDescription className="sr-only">
            Navegación principal, búsqueda de productos y enlace para hacer pedido por WhatsApp.
          </SheetDescription>
        </div>

        <div className="px-6 pt-6 pb-2">
          <form
            onSubmit={handleSearchSubmit}
            role="search"
            className="flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-3"
          >
            <Search
              className="h-4 w-4 shrink-0 text-muted"
              aria-hidden="true"
              strokeWidth={2}
            />
            <input
              ref={searchInputRef}
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar flores..."
              className="flex-1 bg-transparent text-sm font-body text-dark outline-none"
              aria-label="Buscar productos"
              aria-autocomplete="list"
              aria-controls="mobile-search-listbox"
            />
          </form>

          <p className="sr-only" aria-live="polite" aria-atomic="true">
            {searchQuery.trim().length === 0
              ? ""
              : searchResults.length === 0
                ? "Sin resultados"
                : `${searchResults.length} resultado${
                    searchResults.length === 1 ? "" : "s"
                  }`}
          </p>

          {searchResults.length > 0 && (
            <ul
              id="mobile-search-listbox"
              role="listbox"
              aria-label="Resultados de búsqueda"
              className="mt-2 overflow-hidden rounded-2xl border border-border bg-white"
            >
              {searchResults.map((result) => (
                <li
                  key={`${result.categorySlug}/${result.slug}`}
                  role="option"
                  aria-selected={false}
                >
                  <SearchResultItem
                    imageUrl={result.imageUrl}
                    name={result.name}
                    subtitle={result.categoryName}
                    price={`${result.hasVariants ? "Desde " : ""}S/${result.price}`}
                    onClick={() =>
                      handleResultClick(result.categorySlug, result.slug)
                    }
                  />
                </li>
              ))}
              <li>
                <Link
                  href={`/catalogo?q=${encodeURIComponent(searchQuery)}`}
                  onClick={() => {
                    clearSearch();
                    onClose();
                  }}
                  className="flex w-full items-center justify-center gap-1.5 px-4 py-3 font-body text-xs tracking-[0.06em] text-primary uppercase transition-colors duration-150 hover:bg-surface"
                >
                  Ver todos los resultados
                  <ChevronRight
                    className="h-3 w-3"
                    aria-hidden="true"
                    strokeWidth={2}
                  />
                </Link>
              </li>
            </ul>
          )}
        </div>

        <nav
          aria-label="Menú lateral"
          className="flex flex-1 flex-col px-6 py-6"
        >
          <div className="flex flex-col md:hidden">
            {primaryLinks.map((link) =>
              link.isRoute ? (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className="py-3 font-heading text-2xl text-primary visited:text-primary transition-colors duration-200 hover:text-accent"
                >
                  {link.label}
                </Link>
              ) : (
                <button
                  key={link.href}
                  type="button"
                  onClick={() => handleNavigate(link.href)}
                  className="cursor-pointer py-3 text-left font-heading text-2xl text-primary transition-colors duration-200 hover:text-accent"
                >
                  {link.label}
                </button>
              ),
            )}
            <div className="my-2 border-t border-border" />
          </div>

          {secondaryLinks.map((link) => (
            <button
              key={link.href}
              type="button"
              onClick={() => handleNavigate(link.href)}
              className="cursor-pointer py-3 text-left font-heading text-2xl text-primary transition-colors duration-200 hover:text-accent"
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className="px-6 pb-8">
          <button
            type="button"
            onClick={() => handleNavigate("#contacto")}
            className="w-full cursor-pointer rounded-full bg-primary px-6 py-3 font-body text-[0.8rem] font-semibold tracking-[0.08em] text-cream uppercase shadow-sm transition-opacity duration-300 hover:opacity-90"
          >
            Hacer pedido
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
