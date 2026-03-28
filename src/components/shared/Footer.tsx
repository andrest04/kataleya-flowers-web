import { FaInstagram, FaWhatsapp } from "react-icons/fa";
import { BUSINESS } from "@/lib/constants";

const WHATSAPP_LINK = BUSINESS.whatsappWithMessage(
  "Hola Kataleya Flawers, quiero hacer un pedido.",
);

const NAV_LINKS = [
  { href: "#hero", label: "Inicio" },
  { href: "#catalogo", label: "Catalogo" },
  { href: "#nosotros", label: "Nosotros" },
  { href: "#contacto", label: "Contacto" },
];

const COPYRIGHT_YEAR = 2026;

export default function Footer() {
  return (
    <footer
      className="px-4 py-10 sm:px-6 lg:px-8"
      style={{
        backgroundColor: "var(--color-accent)",
        color: "var(--color-cream)",
      }}
    >
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="grid gap-8 text-center md:grid-cols-[1.1fr_0.9fr] md:items-center md:text-left">
          <div className="space-y-3">
            <h2
              className="text-2xl leading-none sm:text-3xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Kataleya Flawers
            </h2>
            <p className="max-w-md text-sm opacity-90 sm:text-base">
              Arreglos florales hechos con amor para cada ocasion especial.
            </p>
            <p className="text-sm opacity-80">
              Lima, Peru · Lun a Sab 8:00am - 7:00pm
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row md:justify-end">
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Escribir a Kataleya Flawers por WhatsApp"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 sm:w-auto"
              style={{
                backgroundColor: "var(--color-whatsapp)",
                color: "var(--color-cream)",
                outlineColor: "var(--color-secondary)",
              }}
            >
              <FaWhatsapp aria-hidden="true" size={18} />
              Pedir por WhatsApp
            </a>

            <a
              href={BUSINESS.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Seguir a Kataleya Flawers en Instagram"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 sm:w-auto"
              style={{
                borderColor:
                  "color-mix(in srgb, var(--color-cream) 45%, transparent)",
                outlineColor: "var(--color-secondary)",
              }}
            >
              <FaInstagram aria-hidden="true" size={17} />
              Instagram
            </a>
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
                  <a
                    href={link.href}
                    className="inline-block rounded-sm py-0.5 opacity-90 transition-opacity hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2"
                    style={{ outlineColor: "var(--color-secondary)" }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="space-y-2 text-sm">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase opacity-80">
              Confianza
            </p>
            <p className="opacity-90">
              Atencion en Lima, Peru para entregas y recojo.
            </p>
            <p className="opacity-80">WhatsApp: +{BUSINESS.phone}</p>
            <a
              href="#contacto"
              className="inline-block rounded-sm font-semibold text-[var(--color-secondary)] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{ outlineColor: "var(--color-secondary)" }}
            >
              Ver ubicacion y mapa
            </a>
          </div>
        </div>

        <p className="text-center text-xs opacity-80 sm:text-left sm:text-sm">
          © {COPYRIGHT_YEAR} Kataleya Flawers · Hecho con amor en Lima, Peru
        </p>
      </div>
    </footer>
  );
}
