"use client";

import { Menu, Search, X } from "lucide-react";
import Link from "next/link";

import { BUSINESS } from "@/lib/constants";

import AnnouncementBar from "./AnnouncementBar";
import DesktopActions from "./DesktopActions";
import DesktopNav from "./DesktopNav";
import MobileDrawer from "./MobileDrawer";
import { useNavbar } from "./useNavbar";

export default function Navbar() {
  const {
    isDrawerOpen,
    setIsDrawerOpen,
    isScrolled,
    isHeaderHidden,
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
      <div className="sticky top-0 z-[90] [overflow-anchor:none]">
        <AnnouncementBar isHidden={isHeaderHidden} />

        <header
          className={`overflow-hidden border-(--color-primary) bg-(--color-cream) transition-[height,box-shadow] duration-300 ease-out motion-reduce:transition-none ${
            isHeaderHidden ? "h-0" : "h-16 border-b"
          }`}
          style={{
            boxShadow: isScrolled
              ? "0 14px 36px color-mix(in srgb, var(--color-dark) 10%, transparent)"
              : "none",
          }}
        >
          <nav
            aria-label="Navegación principal"
            className="grid h-16 w-full grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 sm:px-6 lg:px-10"
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

              <DesktopNav handleNavigate={handleNavigate} />
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

              <DesktopActions
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                handleSearchSubmit={handleSearchSubmit}
                searchResults={searchResults}
                handleResultClick={handleResultClick}
                handleNavigate={handleNavigate}
                desktopSearchRef={desktopSearchRef}
                clearSearch={clearSearch}
              />
            </div>
          </nav>
        </header>
      </div>

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
