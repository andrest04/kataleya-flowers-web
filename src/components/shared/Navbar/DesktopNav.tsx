import { ChevronDown } from "lucide-react";
import Link from "next/link";

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
  openCatalogMenu: () => void;
  scheduleCloseCatalogMenu: () => void;
  closeCatalogMenu: () => void;
}

export default function DesktopNav({
  handleNavigate,
  isCatalogMenuOpen,
  openCatalogMenu,
  scheduleCloseCatalogMenu,
  closeCatalogMenu,
}: DesktopNavProps) {
  return (
    <nav
      aria-label="Secciones"
      className="hidden items-center gap-7 md:flex"
    >
      {CATALOG_LINK && (
        <Link
          href={CATALOG_LINK.href}
          className={`flex items-center gap-1 ${LINK_BASE}`}
          onClick={closeCatalogMenu}
          onMouseEnter={openCatalogMenu}
          onMouseLeave={scheduleCloseCatalogMenu}
          onFocus={openCatalogMenu}
          onBlur={scheduleCloseCatalogMenu}
          aria-haspopup="true"
          aria-expanded={isCatalogMenuOpen}
        >
          {CATALOG_LINK.label}
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform duration-200 ${
              isCatalogMenuOpen ? "rotate-180" : ""
            }`}
            aria-hidden="true"
            strokeWidth={2}
          />
          <span className={UNDERLINE} />
        </Link>
      )}

      {OTHER_LINKS.map((link) =>
        link.isRoute ? (
          <Link key={link.href} href={link.href} className={LINK_BASE}>
            {link.label}
            <span className={UNDERLINE} />
          </Link>
        ) : (
          <button
            key={link.href}
            type="button"
            onClick={() => handleNavigate(link.href)}
            className={`cursor-pointer ${LINK_BASE}`}
          >
            {link.label}
            <span className={UNDERLINE} />
          </button>
        ),
      )}
    </nav>
  );
}
