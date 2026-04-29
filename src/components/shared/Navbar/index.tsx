"use client";

import Link from "next/link";
import { Menu, Search, X } from "lucide-react";
import { BUSINESS } from "@/lib/constants";
import { useNavbar } from "./useNavbar";
import DesktopSearch from "./DesktopSearch";
import MobileDrawer from "./MobileDrawer";

export default function Navbar() {
  const {
    isDrawerOpen,
    setIsDrawerOpen,
    isScrolled,
    searchQuery,
    setSearchQuery,
    searchResults,
    searchInputRef,
    desktopSearchRef,
    clearSearch,
    openDrawer,
    handleNavigate,
    handleSearchSubmit,
    handleResultClick,
  } = useNavbar();

  return (
    <>
      <header
        className="fixed top-0 right-0 left-0 z-[90] transition-all duration-300"
        style={{
          backgroundColor: isScrolled ? "var(--color-cream)" : "transparent",
          boxShadow: isScrolled
            ? "0 14px 36px color-mix(in srgb, var(--color-dark) 10%, transparent)"
            : "none",
          backdropFilter: isScrolled ? "blur(8px)" : "blur(0px)",
        }}
      >
        <nav
          aria-label="Navegación principal"
          className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8"
        >
          {/* Hamburger — siempre visible */}
          <button
            type="button"
            className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center text-(--color-primary)"
            aria-label={isDrawerOpen ? "Cerrar menu" : "Abrir menu"}
            aria-expanded={isDrawerOpen}
            aria-controls="nav-drawer"
            onClick={() => (isDrawerOpen ? setIsDrawerOpen(false) : openDrawer())}
          >
            {isDrawerOpen ? (
              <X className="h-6 w-6" aria-hidden="true" strokeWidth={2} />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" strokeWidth={2} />
            )}
          </button>

          {/* Logo */}
          <Link
            href="/"
            className="font-heading text-[1.45rem] leading-none text-(--color-primary) transition-all duration-300"
          >
            {BUSINESS.name}
          </Link>

          {/* Desktop: Catálogo + search bar con autocomplete + CTA */}
          <div className="hidden items-center gap-4 md:flex">
            <Link
              href="/catalogo"
              className="font-body text-[0.8rem] font-normal tracking-[0.08em] text-(--color-dark) uppercase transition-colors duration-300 hover:text-(--color-accent)"
            >
              Catálogo
            </Link>

            <DesktopSearch
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              handleSearchSubmit={handleSearchSubmit}
              searchResults={searchResults}
              handleResultClick={handleResultClick}
              isScrolled={isScrolled}
              desktopSearchRef={desktopSearchRef}
              clearSearch={clearSearch}
            />

            <button
              type="button"
              className="cursor-pointer rounded-full border border-(--color-primary) px-6 py-3 font-body text-[0.8rem] tracking-[0.08em] text-(--color-primary) uppercase transition-colors duration-300 hover:bg-(--color-primary) hover:text-(--color-cream)"
              onClick={() => handleNavigate("#contacto")}
            >
              Hacer pedido
            </button>
          </div>

          {/* Mobile: solo icono de búsqueda — abre el drawer con auto-focus */}
          <button
            type="button"
            className="flex h-11 w-11 cursor-pointer items-center justify-center text-(--color-primary) md:hidden"
            aria-label="Buscar"
            onClick={openDrawer}
          >
            <Search className="h-5 w-5" aria-hidden="true" strokeWidth={2} />
          </button>
        </nav>
      </header>

      <MobileDrawer
        isDrawerOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSearchSubmit={handleSearchSubmit}
        searchResults={searchResults}
        handleResultClick={handleResultClick}
        handleNavigate={handleNavigate}
        searchInputRef={searchInputRef}
        clearSearch={clearSearch}
      />
    </>
  );
}
