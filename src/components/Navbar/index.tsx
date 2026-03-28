"use client";

import Link from "next/link";
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
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          {/* Hamburger — siempre visible */}
          <button
            type="button"
            className="flex h-11 w-11 shrink-0 cursor-pointer flex-col items-center justify-center gap-1.5"
            aria-label={isDrawerOpen ? "Cerrar menu" : "Abrir menu"}
            aria-expanded={isDrawerOpen}
            aria-controls="nav-drawer"
            onClick={() => (isDrawerOpen ? setIsDrawerOpen(false) : openDrawer())}
          >
            <span
              className="block h-0.5 w-6"
              style={{ backgroundColor: "var(--color-primary)" }}
            />
            <span
              className="block h-0.5 w-6"
              style={{ backgroundColor: "var(--color-primary)" }}
            />
            <span
              className="block h-0.5 w-6"
              style={{ backgroundColor: "var(--color-primary)" }}
            />
          </button>

          {/* Logo */}
          <button
            type="button"
            className="cursor-pointer text-[1.45rem] leading-none transition-all duration-300"
            onClick={() => handleNavigate("#hero")}
            style={{
              color: "var(--color-primary)",
              fontFamily: "var(--font-display)",
            }}
          >
            Kataleya Flawers
          </button>

          {/* Desktop: Catálogo + search bar con autocomplete + CTA */}
          <div className="hidden items-center gap-4 md:flex">
            <Link
              href="/catalogo"
              className="text-[0.8rem] font-normal tracking-[0.08em] uppercase transition-all duration-300"
              style={{ color: "var(--color-dark)", fontFamily: "var(--font-body)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--color-accent)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--color-dark)";
              }}
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
              className="cursor-pointer rounded-full border px-6 py-3 text-[0.8rem] tracking-[0.08em] uppercase transition-all duration-300"
              onClick={() => handleNavigate("#contacto")}
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

          {/* Mobile: solo icono de búsqueda — abre el drawer con auto-focus */}
          <button
            type="button"
            className="flex h-11 w-11 cursor-pointer items-center justify-center md:hidden"
            aria-label="Buscar"
            onClick={openDrawer}
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              style={{ color: "var(--color-primary)" }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
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
