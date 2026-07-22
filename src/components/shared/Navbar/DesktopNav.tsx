import Link from "next/link";

import { primaryLinks, secondaryLinks } from "./constants";

const DESKTOP_LINKS = [...primaryLinks, ...secondaryLinks].filter(
  (link) => link.href !== "#hero",
);

const LINK_BASE =
  "group relative font-body text-[0.9rem] font-normal tracking-normal text-(--color-dark) visited:text-(--color-dark) transition-colors duration-200 hover:text-(--color-primary)";

const UNDERLINE =
  "absolute -bottom-1 left-0 h-px w-0 bg-(--color-primary) transition-[width] duration-300 group-hover:w-full";

interface DesktopNavProps {
  handleNavigate: (href: string) => void;
}

export default function DesktopNav({ handleNavigate }: DesktopNavProps) {
  return (
    <nav
      aria-label="Secciones"
      className="hidden items-center gap-7 md:flex"
    >
      {DESKTOP_LINKS.map((link) =>
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
