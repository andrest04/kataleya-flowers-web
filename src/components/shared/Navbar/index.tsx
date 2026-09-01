"use client";

import { Menu, Search, X } from "lucide-react";
import Link from "next/link";

import { type SiteSettings, visibleAnnouncement } from "@/lib/siteSettings";

import AnnouncementBar from "./AnnouncementBar";
import CatalogMenu from "./CatalogMenu";
import DesktopActions from "./DesktopActions";
import DesktopNav from "./DesktopNav";
import MobileDrawer from "./MobileDrawer";
import SearchOverlay from "./SearchOverlay";
import { useNavbar } from "./useNavbar";

interface NavbarProps {
  settings: SiteSettings;
}

export default function Navbar({ settings }: NavbarProps) {
  const {
    isDrawerOpen,
    setIsDrawerOpen,
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

  const announcement = visibleAnnouncement(settings);
  const chromeHeight = announcement ? "h-26" : "h-16";

  return (
    <>
      <div className={`sticky top-0 z-[90] ${chromeHeight} pointer-events-none [overflow-anchor:none]`}>
        <div
          className={`${chromeHeight} transition-transform duration-300 ease-out motion-reduce:transition-none ${
            isHeaderHidden ? "pointer-events-none -translate-y-full" : "pointer-events-auto translate-y-0"
          }`}
        >
          <AnnouncementBar
            announcement={announcement}
            phone={settings.phone}
            whatsappDefault={settings.messages.whatsappDefault}
          />

          <header
            className={`h-16 border-b border-(--color-primary) bg-(--color-cream) ${
              isSearchOpen || isCatalogMenuOpen ? "overflow-visible" : "overflow-hidden"
            }`}
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
                className="font-heading text-[1.75rem] font-bold uppercase tracking-[0.1em] leading-none text-(--color-primary)"
              >
                Kataleya
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

                <DesktopActions
                  brandName={settings.name}
                  handleNavigate={handleNavigate}
                  openSearch={openSearch}
                />
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
        brandName={settings.name}
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
