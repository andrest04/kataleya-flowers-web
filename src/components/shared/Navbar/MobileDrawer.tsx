"use client";

import { ChevronRight, Search } from "lucide-react";
import Link from "next/link";
import type { FormEvent, RefObject } from "react";

import SearchResultItem from "@/components/shared/SearchResultItem";
import Button from "@/components/ui/Button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/primitives/sheet";

import type { SearchResult } from "./constants";
import { primaryLinks, secondaryLinks } from "./constants";
import { useComboboxNavigation } from "./useComboboxNavigation";

interface MobileDrawerProps {
  brandName: string;
  whatsappHref: string;
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
  brandName,
  whatsappHref,
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
  const { activeDescendant, onKeyDown, getOptionProps } = useComboboxNavigation({
    idPrefix: "mobile-search",
    items: searchResults,
    inputValue: searchQuery,
    onSelect: (result) => handleResultClick(result.categorySlug, result.slug),
  });

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
        overlayClassName="z-[92]"
        closeButtonClassName="size-11 md:size-7"
        aria-label="Menú de navegación"
        onEscapeKeyDown={(event) => {
          if (event.target === searchInputRef.current && searchQuery) {
            event.preventDefault();
            clearSearch();
          }
        }}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <SheetTitle className="text-lg text-primary font-heading">
            {brandName}
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
              onKeyDown={onKeyDown}
              name="q"
              autoComplete="off"
              placeholder="Buscar flores…"
              className="flex-1 bg-transparent text-base md:text-sm font-body text-dark outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-primary)"
              aria-label="Buscar productos"
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={searchResults.length > 0}
              aria-controls="mobile-search-listbox"
              aria-activedescendant={activeDescendant}
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
            <div className="mt-2 overflow-hidden rounded-2xl border border-border bg-white">
              <ul
                id="mobile-search-listbox"
                role="listbox"
                aria-label="Resultados de búsqueda"
              >
                {searchResults.map((result, index) => (
                  <li
                    key={`${result.categorySlug}/${result.slug}`}
                    {...getOptionProps(index)}
                    className="aria-selected:bg-surface"
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
              </ul>
              <Link
                href={`/buscar?q=${encodeURIComponent(searchQuery)}`}
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
            </div>
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
                <a
                  key={link.href}
                  href={`/${link.href}`}
                  onClick={(event) => {
                    if (document.getElementById(link.href.slice(1))) {
                      event.preventDefault();
                      handleNavigate(link.href);
                    }
                  }}
                  className="py-3 text-left font-heading text-2xl text-primary transition-colors duration-200 hover:text-accent"
                >
                  {link.label}
                </a>
              ),
            )}
            <div className="my-2 border-t border-border" />
          </div>

          {secondaryLinks.map((link) => (
            <a
              key={link.href}
              href={`/${link.href}`}
              onClick={(event) => {
                if (document.getElementById(link.href.slice(1))) {
                  event.preventDefault();
                  handleNavigate(link.href);
                }
              }}
              className="py-3 text-left font-heading text-2xl text-primary transition-colors duration-200 hover:text-accent"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="px-6 pb-8">
          <Button variant="whatsapp" size="lg" href={whatsappHref} external fullWidth>
            Pedir por WhatsApp
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
