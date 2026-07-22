"use client";

import { ShoppingBag } from "lucide-react";
import type { FormEvent, RefObject } from "react";

import { BUSINESS } from "@/lib/constants";

import type { SearchResult } from "./constants";
import DesktopSearch from "./DesktopSearch";

interface DesktopActionsProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  handleSearchSubmit: (e: FormEvent) => void;
  searchResults: SearchResult[];
  handleResultClick: (categorySlug: string, productSlug: string) => void;
  handleNavigate: (href: string) => void;
  desktopSearchRef: RefObject<HTMLDivElement | null>;
  clearSearch: () => void;
}

export default function DesktopActions({
  searchQuery,
  setSearchQuery,
  handleSearchSubmit,
  searchResults,
  handleResultClick,
  handleNavigate,
  desktopSearchRef,
  clearSearch,
}: DesktopActionsProps) {
  return (
    <div className="hidden items-center justify-end gap-6 md:flex">
      <button
        type="button"
        onClick={() => handleNavigate("#contacto")}
        className="cursor-pointer font-body text-[0.9rem] text-(--color-dark) transition-colors duration-200 hover:text-(--color-primary)"
        aria-label={`Hacer pedido por WhatsApp a ${BUSINESS.name}`}
      >
        Hacer pedido
      </button>

      <DesktopSearch
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSearchSubmit={handleSearchSubmit}
        searchResults={searchResults}
        handleResultClick={handleResultClick}
        desktopSearchRef={desktopSearchRef}
        clearSearch={clearSearch}
      />

      <button
        type="button"
        className="flex h-11 w-11 cursor-pointer items-center justify-center text-(--color-dark) transition-colors duration-200 hover:text-(--color-primary)"
        aria-label="Carrito"
      >
        <ShoppingBag className="h-5 w-5" aria-hidden="true" strokeWidth={2} />
      </button>
    </div>
  );
}
