import { ChevronDown } from "lucide-react";
import Link from "next/link";
import type { FocusEvent, RefObject } from "react";

import { primaryLinks, secondaryLinks } from "./constants";

const ALL_LINKS = [...primaryLinks, ...secondaryLinks].filter(
  (link) => link.href !== "#hero",
);
const CATALOG_LINK = ALL_LINKS.find((link) => link.href === "/catalogo");
const OTHER_LINKS = ALL_LINKS.filter((link) => link.href !== "/catalogo");

const LINK_BASE =
  "group relative font-body text-[0.9rem] font-normal tracking-normal text-(--color-dark) visited:text-(--color-dark) transition-colors duration-200 hover:text-(--color-primary)";

const UNDERLINE =
  "absolute -bottom-1 left-0 h-px w-0 bg-(--color-primary) transition-[width] duration-300 group-hover:w-full";

interface DesktopNavProps {
  handleNavigate: (href: string) => void;
  isCatalogMenuOpen: boolean;
  catalogTriggerRef: RefObject<HTMLButtonElement | null>;
  openCatalogMenu: () => void;
  toggleCatalogMenu: () => void;
  handleCatalogMenuBlur: (event: FocusEvent<HTMLElement>) => void;
  scheduleCloseCatalogMenu: () => void;
  closeCatalogMenu: () => void;
}

export default function DesktopNav({
  handleNavigate,
  isCatalogMenuOpen,
  catalogTriggerRef,
  openCatalogMenu,
  toggleCatalogMenu,
  handleCatalogMenuBlur,
  scheduleCloseCatalogMenu,
  closeCatalogMenu,
}: DesktopNavProps) {
  return (
    <nav
      aria-label="Secciones"
      className="hidden items-center gap-7 md:flex"
    >
      {CATALOG_LINK && (
        <div
          className="flex items-center"
          onMouseEnter={openCatalogMenu}
          onMouseLeave={scheduleCloseCatalogMenu}
        >
          <Link
            href={CATALOG_LINK.href}
            className={LINK_BASE}
            onClick={closeCatalogMenu}
          >
            {CATALOG_LINK.label}
            <span className={UNDERLINE} />
          </Link>
          <button
            ref={catalogTriggerRef}
            type="button"
            className="flex h-8 w-6 cursor-pointer items-center justify-center text-(--color-dark) transition-colors duration-200 hover:text-(--color-primary)"
            aria-label="Ver categorías"
            aria-expanded={isCatalogMenuOpen}
            aria-controls="catalog-menu"
            onClick={(event) =>
              event.detail === 0 ? toggleCatalogMenu() : openCatalogMenu()
            }
            onBlur={handleCatalogMenuBlur}
          >
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform duration-200 ${
                isCatalogMenuOpen ? "rotate-180" : ""
              }`}
              aria-hidden="true"
              strokeWidth={2}
            />
          </button>
        </div>
      )}

      {OTHER_LINKS.map((link) =>
        link.isRoute ? (
          <Link key={link.href} href={link.href} className={LINK_BASE}>
            {link.label}
            <span className={UNDERLINE} />
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
            className={LINK_BASE}
          >
            {link.label}
            <span className={UNDERLINE} />
          </a>
        ),
      )}
    </nav>
  );
}
