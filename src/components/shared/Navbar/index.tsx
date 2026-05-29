"use client";

import { Menu, Search, X } from "lucide-react";
import Link from "next/link";

import { BUSINESS } from "@/lib/constants";

import DesktopNav from "./DesktopNav";
import MobileDrawer from "./MobileDrawer";
import { useNavbar } from "./useNavbar";

export default function Navbar() {
  const {
    isDrawerOpen,
    setIsDrawerOpen,
    isScrolled,
    overHero,
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

  // Color de logo/íconos: crema sobre el hero oscuro, rojo en el resto.
  const topItemColor = overHero ? "text-(--color-cream)" : "text-(--color-primary)";

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
          {/* Hamburger — solo mobile (en desktop la nav va inline) */}
          <button
            type="button"
            className={`flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center transition-colors duration-300 md:hidden ${topItemColor}`}
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
            className={`font-heading text-[1.5rem] leading-none transition-all duration-300 ${topItemColor}`}
          >
            {BUSINESS.name}
          </Link>

          {/* Desktop: links de sección + búsqueda + CTA sólido */}
          <DesktopNav
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleSearchSubmit={handleSearchSubmit}
            searchResults={searchResults}
            handleResultClick={handleResultClick}
            handleNavigate={handleNavigate}
            isScrolled={isScrolled}
            overHero={overHero}
            desktopSearchRef={desktopSearchRef}
            clearSearch={clearSearch}
          />

          {/* Mobile: icono de búsqueda — abre el drawer con auto-focus */}
          <button
            type="button"
            className={`flex h-11 w-11 cursor-pointer items-center justify-center transition-colors duration-300 md:hidden ${topItemColor}`}
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
