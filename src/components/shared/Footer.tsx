import { ArrowRight, ChevronRight } from "lucide-react";
import Link from "next/link";
import { FaInstagram, FaWhatsapp } from "react-icons/fa";

import FooterAnchorLink from "@/components/shared/FooterAnchorLink";
import Image from '@/components/ui/AppwriteImage';
import { getCategories } from "@/features/catalog/queries/getCategories";
import { BUSINESS } from "@/lib/constants";
import { allNavLinks } from "@/lib/navigation";

const WHATSAPP_LINK = BUSINESS.whatsappWithMessage(BUSINESS.messages.whatsappDefault);
const COPYRIGHT_YEAR = 2026;

export default async function Footer() {
  const categories = await getCategories();

  return (
    <footer className="border-t border-(--color-primary) bg-(--color-surface) text-(--color-dark)">
      <div className="px-4 pt-[74px] sm:px-6 lg:px-[77px]">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_2fr] lg:gap-20 xl:grid-cols-[1fr_2.4fr]">
          <div className="space-y-6 lg:pb-[74px]">
            <h2 className="font-heading text-2xl tracking-[0.1em] uppercase">{BUSINESS.name}</h2>

            <p className="font-heading text-2xl leading-tight sm:text-3xl">
              Flores frescas para cada momento especial en {BUSINESS.location}.
            </p>

            <Link
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full max-w-sm items-center justify-between border border-(--color-dark) bg-(--color-white) px-4 py-3 text-sm font-semibold transition-colors hover:bg-(--color-surface) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-secondary)"
            >
              Pedir por WhatsApp
              <span className="sr-only"> (se abre en una pestaña nueva)</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-8 lg:ml-auto lg:mr-10 lg:flex lg:flex-row lg:flex-wrap lg:gap-x-[88.8889px] lg:gap-y-0">
            <nav aria-label="Catálogo" className="space-y-3">
              <p className="font-body text-xs font-semibold tracking-[0.15em] uppercase opacity-70">
                Catálogo
              </p>
              <ul className="space-y-2 font-body text-sm">
                {categories.map((category) => (
                  <li key={category.id}>
                    <Link
                      href={`/catalogo/${category.slug}`}
                      className="transition-colors hover:text-(--color-primary) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-secondary)"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="/catalogo"
                    className="transition-colors hover:text-(--color-primary) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-secondary)"
                  >
                    Ver todo
                  </Link>
                </li>
              </ul>
            </nav>

            <nav aria-label="Navegación del sitio" className="space-y-3">
              <p className="font-body text-xs font-semibold tracking-[0.15em] uppercase opacity-70">
                Navegación
              </p>
              <ul className="space-y-2 font-body text-sm">
                {allNavLinks.map((link) =>
                  link.isRoute ? (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="transition-colors hover:text-(--color-primary) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-secondary)"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ) : (
                    <li key={link.href}>
                      <FooterAnchorLink
                        href={link.href}
                        className="transition-colors hover:text-(--color-primary) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-secondary)"
                      >
                        {link.label}
                      </FooterAnchorLink>
                    </li>
                  ),
                )}
              </ul>
            </nav>

            <div className="space-y-3">
              <p className="font-body text-xs font-semibold tracking-[0.15em] uppercase opacity-70">
                Ayuda
              </p>
              <ul className="space-y-2 font-body text-sm">
                <li>
                  <Link
                    href="/libro-de-reclamaciones"
                    className="transition-colors hover:text-(--color-primary) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-secondary)"
                  >
                    Libro de Reclamaciones
                  </Link>
                </li>
              </ul>
              <Link
                href="/libro-de-reclamaciones"
                aria-label="Libro de Reclamaciones — registra tu queja o reclamo"
                className="mt-2 block w-fit rounded-sm bg-(--color-white) p-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-secondary)"
              >
                <span className="relative block h-[54px] w-[90px]">
                  <Image
                    src="/libro-reclamaciones-indecopi.png"
                    alt="Aviso del Libro de Reclamaciones (INDECOPI)"
                    fill
                    sizes="90px"
                    className="object-contain"
                  />
                </span>
              </Link>
            </div>

            <div className="space-y-3">
              <p className="font-body text-xs font-semibold tracking-[0.15em] uppercase opacity-70">
                Negocio
              </p>
              <ul className="space-y-2 font-body text-sm">
                <li>
                  <FooterAnchorLink
                    href="#nosotros"
                    className="transition-colors hover:text-(--color-primary) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-secondary)"
                  >
                    Nosotros
                  </FooterAnchorLink>
                </li>
                <li className="opacity-80">
                  {BUSINESS.hours.weekdays} · {BUSINESS.hours.time}
                </li>
                <li className="opacity-80">{BUSINESS.location}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center px-4 pt-6 pb-14 sm:px-6 lg:px-[77px]">
        <div className="-ml-1 flex items-center gap-5">
          <a
            href={BUSINESS.instagram}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Seguir a ${BUSINESS.name} en Instagram`}
            className="-m-3 p-3 transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-secondary)"
          >
            <FaInstagram size={20} aria-hidden="true" />
            <span className="sr-only"> (se abre en una pestaña nueva)</span>
          </a>
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Escribir a ${BUSINESS.name} por WhatsApp`}
            className="-m-3 p-3 transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-secondary)"
          >
            <FaWhatsapp size={20} aria-hidden="true" />
            <span className="sr-only"> (se abre en una pestaña nueva)</span>
          </a>
        </div>
      </div>

      <div className="border-t border-(--color-primary)">
        <div className="px-4 pt-5 pb-[18px] sm:px-6 lg:px-[77px]">
          <FooterAnchorLink
            href="#contacto"
            className="inline-flex items-center gap-1 font-body text-sm font-semibold transition-colors hover:text-(--color-primary) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-secondary)"
          >
            Entregas en {BUSINESS.location}
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </FooterAnchorLink>
        </div>
      </div>

      <div className="border-t border-(--color-primary)">
        <div className="px-4 pt-5 pb-[18px] sm:px-6 lg:px-[77px]">
          <p className="font-heading text-sm opacity-80">
            © {COPYRIGHT_YEAR} {BUSINESS.name}
          </p>
        </div>
      </div>
    </footer>
  );
}
