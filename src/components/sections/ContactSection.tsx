import { FaInstagram, FaWhatsapp } from "react-icons/fa";

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

export default function ContactSection() {
  return (
    <section
      id="contacto"
      className="scroll-mt-32 min-h-screen px-4 pt-24 pb-56 sm:px-6 md:min-h-0 md:pb-40 lg:px-8 lg:pb-48"
    >
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        {/* Lado izquierdo - Mapa */}
        <div className="space-y-6">
          <div className="space-y-4">
            <p
              className="text-sm font-semibold tracking-[0.2em] uppercase"
              style={{ color: "var(--color-accent)" }}
            >
              Atención cercana
            </p>
            <h2
              className="text-4xl sm:text-5xl"
              style={{
                color: "var(--color-primary)",
                fontFamily: "var(--font-heading)",
              }}
            >
              Contáctanos
            </h2>
            <p className="max-w-xl text-lg leading-8">
              Estamos en Lima para crear el arreglo perfecto para ti
            </p>
          </div>

          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3900.667835343661!2d-77.0213840240266!3d-12.134864543549192!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9105b7fe8f580c29%3A0xf37f77a4ef274530!2sFlorer%C3%ADa%20Floritel!5e0!3m2!1sen!2spe!4v1773457299751!5m2!1sen!2spe"
            width="100%"
            height="220"
            style={{ border: 0, borderRadius: "12px" }}
            title="Mapa de ubicación de Kataleya Flawers"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        {/* Lado derecho - Botones y horario */}
        <div className="space-y-6">
          <div className="space-y-3">
            <h3
              className="text-3xl sm:text-4xl"
              style={{
                color: "var(--color-primary)",
                fontFamily: "var(--font-heading)",
              }}
            >
              ¿Listo para crear algo especial?
            </h3>
            <p className="text-base" style={{ color: "var(--color-dark)" }}>
              Cuéntanos qué necesitas y lo hacemos realidad.
            </p>
          </div>

          {/* Botón WhatsApp */}
          <a
            href="https://wa.me/51990051041"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between rounded-2xl p-4 transition-all duration-300 hover:opacity-95"
            style={{ backgroundColor: "#25d366" }}
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                <FaWhatsapp size={24} className="text-white" />
              </div>
              <div>
                <p className="text-base font-semibold text-white">
                  Escribir por WhatsApp
                </p>
                <p className="text-sm text-white/80">+51 990 051 041</p>
              </div>
            </div>
            <ArrowRightIcon className="h-6 w-6 text-white transition-transform duration-300 group-hover:translate-x-1" />
          </a>

          {/* Botón Instagram */}
          <a
            href="https://instagram.com/kataleyaflawers12"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between rounded-2xl p-4 transition-all duration-300 hover:opacity-95"
            style={{ backgroundColor: "var(--color-dark)" }}
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                <FaInstagram size={24} className="text-white" />
              </div>
              <div>
                <p className="text-base font-semibold text-white">
                  Seguirnos en Instagram
                </p>
                <p className="text-sm text-white/80">@kataleyaflawers12</p>
              </div>
            </div>
            <ArrowRightIcon className="h-6 w-6 text-white transition-transform duration-300 group-hover:translate-x-1" />
          </a>

          {/* Separador */}
          <div className="flex items-center justify-center py-2">
            <span
              className="text-sm font-medium"
              style={{ color: "var(--color-dark)", opacity: 0.5 }}
            >
              o
            </span>
          </div>

          {/* Card de horario */}
          <div
            className="flex items-center justify-between rounded-xl border p-4"
            style={{
              backgroundColor: "var(--color-cream)",
              borderColor:
                "color-mix(in srgb, var(--color-accent) 20%, transparent)",
            }}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">🕐</span>
              <span
                className="text-sm font-medium"
                style={{ color: "var(--color-dark)" }}
              >
                Lunes a Sábado · 8:00am — 7:00pm
              </span>
            </div>
            <span
              className="rounded-full px-3 py-1 text-xs font-semibold"
              style={{
                backgroundColor: "var(--color-accent)",
                color: "var(--color-cream)",
              }}
            >
              ABIERTO
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
