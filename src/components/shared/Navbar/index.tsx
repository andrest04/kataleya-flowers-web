"use client";

import { Menu, Search, X } from "lucide-react";
import Link from "next/link";

import { BUSINESS } from "@/lib/constants";

import AnnouncementBar from "./AnnouncementBar";
import CatalogMenu from "./CatalogMenu";
import DesktopActions from "./DesktopActions";
import DesktopNav from "./DesktopNav";
import MobileDrawer from "./MobileDrawer";
import SearchOverlay from "./SearchOverlay";
import { useNavbar } from "./useNavbar";

export default function Navbar() {
  const {
    isDrawerOpen,
    setIsDrawerOpen,
    isScrolled,
    isHeaderHidden,
    isSearchOpen,
    openSearch,
    closeSearch,
    searchQuery,
    setSearchQuery,
    searchResults,
    suggestions,
    searchInputRef,
    desktopSearchRef,
    clearSearch,
    isCatalogMenuOpen,
    catalogMenuCategories,
    catalogMenuRef,
    openCatalogMenu,
    scheduleCloseCatalogMenu,
    cancelCloseCatalogMenu,
    closeCatalogMenu,
    openDrawer,
    handleNavigate,
    handleSearchSubmit,
    handleResultClick,
  } = useNavbar();

  return (
    <>
      <div className="sticky top-0 z-[90] [overflow-anchor:none]">
        <AnnouncementBar isHidden={isHeaderHidden} />

        <header
          className={`border-(--color-primary) bg-(--color-cream) transition-[height,box-shadow] duration-300 ease-out motion-reduce:transition-none ${
            isSearchOpen || isCatalogMenuOpen ? "overflow-visible" : "overflow-hidden"
          } ${isHeaderHidden ? "h-0" : "h-16 border-b"}`}
          style={{
            boxShadow: isScrolled
              ? "0 14px 36px color-mix(in srgb, var(--color-dark) 10%, transparent)"
              : "none",
          }}
        >
          <nav
            aria-label="Navegación principal"
            className="flex h-16 w-full items-center"
          >
            <div
              className={`grid w-full grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 sm:px-6 lg:px-10 ${
                isSearchOpen ? "md:hidden" : ""
              }`}
            >
              <div className="flex items-center justify-start">
                <button
                  type="button"
                  className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center text-(--color-primary) md:hidden"
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

                <DesktopNav
                  handleNavigate={handleNavigate}
                  isCatalogMenuOpen={isCatalogMenuOpen}
                  openCatalogMenu={openCatalogMenu}
                  scheduleCloseCatalogMenu={scheduleCloseCatalogMenu}
                  closeCatalogMenu={closeCatalogMenu}
                />
              </div>

              <Link
                href="/"
                className="font-heading text-[1.5rem] leading-none text-(--color-primary)"
              >
                {BUSINESS.name}
              </Link>

              <div className="flex items-center justify-end">
                <button
                  type="button"
                  className="flex h-11 w-11 cursor-pointer items-center justify-center text-(--color-primary) md:hidden"
                  aria-label="Buscar"
                  onClick={openDrawer}
                >
                  <Search className="h-5 w-5" aria-hidden="true" strokeWidth={2} />
                </button>

                <DesktopActions handleNavigate={handleNavigate} openSearch={openSearch} />
              </div>
            </div>

            {isSearchOpen && (
              <SearchOverlay
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                handleSearchSubmit={handleSearchSubmit}
                searchResults={searchResults}
                suggestions={suggestions}
                handleResultClick={handleResultClick}
                desktopSearchRef={desktopSearchRef}
                closeSearch={closeSearch}
              />
            )}

            {isCatalogMenuOpen && (
              <CatalogMenu
                categories={catalogMenuCategories}
                catalogMenuRef={catalogMenuRef}
                onMouseEnter={cancelCloseCatalogMenu}
                onMouseLeave={scheduleCloseCatalogMenu}
                onNavigate={closeCatalogMenu}
              />
            )}
          </nav>
        </header>
      </div>

      {(isSearchOpen || isCatalogMenuOpen) && (
        <div
          className="fixed inset-0 z-[85] hidden md:block"
          style={{
            backgroundColor: "color-mix(in srgb, var(--color-dark) 55%, transparent)",
          }}
          onClick={isCatalogMenuOpen ? closeCatalogMenu : closeSearch}
          aria-hidden="true"
        />
      )}

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
