"use client";

import type { FormEvent, RefObject } from "react";
import Image from "next/image";
import Link from "next/link";
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";
import { primaryLinks, secondaryLinks } from "./constants";
import type { SearchResult } from "./constants";

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
    <LazyMotion features={domAnimation}>
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            {/* Backdrop */}
            <m.div
              key="drawer-backdrop"
              className="fixed inset-0 z-[85]"
              style={{
                backgroundColor:
                  "color-mix(in srgb, var(--color-dark) 40%, transparent)",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onClose}
              aria-hidden="true"
            />

            {/* Panel del drawer */}
            <m.aside
              id="nav-drawer"
              key="drawer-panel"
              className="fixed bottom-0 left-0 top-0 z-[95] flex w-72 flex-col overflow-y-auto"
              style={{ backgroundColor: "var(--color-cream)" }}
              initial={{ x: -288 }}
              animate={{ x: 0 }}
              exit={{ x: -288 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              role="dialog"
              aria-modal="true"
              aria-label="Menú de navegación"
            >
              {/* Header del drawer */}
              <div
                className="flex items-center justify-between px-6 py-5"
                style={{ borderBottom: "1px solid var(--color-border)" }}
              >
                <span
                  className="text-lg"
                  style={{
                    color: "var(--color-primary)",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  Kataleya Flawers
                </span>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full transition-all duration-200"
                  style={{ backgroundColor: "var(--color-surface)" }}
                  aria-label="Cerrar menú"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    style={{ color: "var(--color-dark)" }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Search bar dentro del drawer — auto-focus aquí */}
              <div className="px-6 pb-2 pt-6">
                <form
                  onSubmit={handleSearchSubmit}
                  className="flex items-center gap-2 rounded-full px-4 py-3"
                  style={{
                    border: "1px solid var(--color-border)",
                    backgroundColor: "var(--color-surface)",
                  }}
                >
                  <svg
                    className="h-4 w-4 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    style={{ color: "var(--color-muted)" }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    ref={searchInputRef}
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar flores..."
                    className="flex-1 bg-transparent text-sm outline-none"
                    style={{ color: "var(--color-dark)", fontFamily: "var(--font-body)" }}
                    aria-label="Buscar productos"
                  />
                </form>

                {/* Resultados de autocomplete — drawer (mobile) */}
                {searchResults.length > 0 && (
                  <div
                    className="mt-2 overflow-hidden rounded-2xl"
                    style={{
                      border: "1px solid var(--color-border)",
                      backgroundColor: "var(--color-white)",
                    }}
                  >
                    {searchResults.map((result) => (
                      <button
                        key={`${result.categorySlug}/${result.slug}`}
                        type="button"
                        onClick={() =>
                          handleResultClick(result.categorySlug, result.slug)
                        }
                        className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors duration-150"
                        style={{ borderBottom: "1px solid var(--color-border)" }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor =
                            "var(--color-surface)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor =
                            "var(--color-white)";
                        }}
                      >
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                          <Image
                            src={result.imageUrl}
                            alt={result.name}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p
                            className="truncate text-sm font-medium"
                            style={{
                              color: "var(--color-dark)",
                              fontFamily: "var(--font-body)",
                            }}
                          >
                            {result.name}
                          </p>
                          <p
                            className="truncate text-xs"
                            style={{
                              color: "var(--color-muted)",
                              fontFamily: "var(--font-body)",
                            }}
                          >
                            {result.categoryName}
                          </p>
                        </div>
                        <span
                          className="shrink-0 text-sm font-medium"
                          style={{
                            color: "var(--color-primary)",
                            fontFamily: "var(--font-body)",
                          }}
                        >
                          {result.hasVariants ? "Desde " : ""}S/{result.price}
                        </span>
                      </button>
                    ))}
                    <Link
                      href={`/catalogo?q=${encodeURIComponent(searchQuery)}`}
                      onClick={() => {
                        clearSearch();
                        onClose();
                      }}
                      className="flex w-full items-center justify-center gap-1.5 px-4 py-3 text-xs tracking-[0.06em] uppercase transition-colors duration-150"
                      style={{
                        color: "var(--color-primary)",
                        fontFamily: "var(--font-body)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor =
                          "var(--color-surface)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      Ver todos los resultados
                      <svg
                        className="h-3 w-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>
                  </div>
                )}
              </div>

              {/* Links de navegación */}
              <nav className="flex flex-1 flex-col px-6 py-6">
                {/* Links primarios — solo en mobile (en desktop están en el navbar) */}
                <div className="flex flex-col md:hidden">
                  {primaryLinks.map((link) =>
                    link.isRoute ? (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={onClose}
                        className="py-3 text-2xl transition-all duration-200"
                        style={{
                          color: "var(--color-primary)",
                          fontFamily: "var(--font-display)",
                        }}
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <button
                        key={link.href}
                        type="button"
                        onClick={() => handleNavigate(link.href)}
                        className="cursor-pointer py-3 text-left text-2xl transition-all duration-200"
                        style={{
                          color: "var(--color-primary)",
                          fontFamily: "var(--font-display)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = "var(--color-accent)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = "var(--color-primary)";
                        }}
                      >
                        {link.label}
                      </button>
                    )
                  )}
                  <div
                    className="my-2"
                    style={{ borderTop: "1px solid var(--color-border)" }}
                  />
                </div>

                {/* Links secundarios — siempre visibles en el drawer */}
                {secondaryLinks.map((link) => (
                  <button
                    key={link.href}
                    type="button"
                    onClick={() => handleNavigate(link.href)}
                    className="cursor-pointer py-3 text-left text-2xl transition-all duration-200"
                    style={{
                      color: "var(--color-primary)",
                      fontFamily: "var(--font-display)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "var(--color-accent)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "var(--color-primary)";
                    }}
                  >
                    {link.label}
                  </button>
                ))}
              </nav>

              {/* CTA al fondo */}
              <div className="px-6 pb-8">
                <button
                  type="button"
                  onClick={() => handleNavigate("#contacto")}
                  className="w-full cursor-pointer rounded-full border px-6 py-3 text-[0.8rem] tracking-[0.08em] uppercase transition-all duration-300"
                  style={{
                    borderColor: "var(--color-primary)",
                    color: "var(--color-primary)",
                    fontFamily: "var(--font-body)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--color-primary)";
                    e.currentTarget.style.color = "var(--color-cream)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "var(--color-primary)";
                  }}
                >
                  Hacer pedido
                </button>
              </div>
            </m.aside>
          </>
        )}
      </AnimatePresence>
    </LazyMotion>
  );
}
