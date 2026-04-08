import Link from "next/link";
import { FaInstagram, FaWhatsapp } from "react-icons/fa";
import { BUSINESS } from "@/lib/constants";
import Button from "@/components/ui/Button";

const WHATSAPP_LINK = BUSINESS.whatsappWithMessage(BUSINESS.messages.whatsappDefault);

const NAV_LINKS = [
  { href: "/#hero", label: "Inicio" },
  { href: "/#catalogo", label: "Catalogo" },
  { href: "/#nosotros", label: "Nosotros" },
  { href: "/#contacto", label: "Contacto" },
];

const COPYRIGHT_YEAR = 2026;

export default function Footer() {
  return (
    <footer className="bg-accent text-cream px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="grid gap-8 text-center md:grid-cols-[1.1fr_0.9fr] md:items-center md:text-left">
          <div className="space-y-3">
            <h2 className="text-2xl leading-none sm:text-3xl font-heading">
              {BUSINESS.name}
            </h2>
            <p className="max-w-md text-sm opacity-90 sm:text-base">
              Arreglos florales hechos con amor para cada ocasion especial.
            </p>
            <p className="text-sm opacity-80">
              {BUSINESS.location} · {BUSINESS.hours.weekdays} {BUSINESS.hours.time}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row md:justify-end">
            <Button
              variant="whatsapp"
              size="md"
              href={WHATSAPP_LINK}
              external
              aria-label={`Escribir a ${BUSINESS.name} por WhatsApp`}
              className="w-full sm:w-auto focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{ outlineColor: "var(--color-secondary)" }}
            >
              <FaWhatsapp aria-hidden="true" size={18} />
              Pedir por WhatsApp
            </Button>

            <Button
              variant="secondary"
              size="md"
              href={BUSINESS.instagram}
              external
              aria-label={`Seguir a ${BUSINESS.name} en Instagram`}
              className="w-full sm:w-auto focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                borderColor: "color-mix(in srgb, var(--color-cream) 45%, transparent)",
                color: "var(--color-cream)",
                outlineColor: "var(--color-secondary)",
              }}
            >
              <FaInstagram aria-hidden="true" size={17} />
              Instagram
            </Button>
          </div>
        </div>

        <div
          className="grid gap-6 border-t pt-6 text-center sm:grid-cols-2 sm:text-left"
          style={{
            borderColor:
              "color-mix(in srgb, var(--color-cream) 20%, transparent)",
          }}
        >
          <nav aria-label="Navegacion del sitio" className="space-y-2">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase opacity-80">
              Navegacion
            </p>
            <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm sm:justify-start">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-block rounded-sm py-0.5 opacity-90 transition-opacity hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2"
                    style={{ outlineColor: "var(--color-secondary)" }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="space-y-2 text-sm">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase opacity-80">
              Confianza
            </p>
            <p className="opacity-90">
              Atencion en {BUSINESS.location} para entregas y recojo.
            </p>
            <p className="opacity-80">WhatsApp: +{BUSINESS.phone}</p>
            <Link
              href="/#contacto"
              className="inline-block rounded-sm font-semibold text-[var(--color-secondary)] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{ outlineColor: "var(--color-secondary)" }}
            >
              Ver ubicacion y mapa
            </Link>
          </div>
        </div>

        <p className="text-center text-xs opacity-80 sm:text-left sm:text-sm">
          © {COPYRIGHT_YEAR} {BUSINESS.name} · Hecho con amor en {BUSINESS.location}
        </p>
      </div>
    </footer>
  );
}
