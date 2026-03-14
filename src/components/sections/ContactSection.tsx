function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.689 9.689 0 01-4.51-1.1l-.322-.193-3.335.876.893-3.252-.188-.298a9.643 9.643 0 01-1.468-5.183c0-5.363 4.361-9.719 9.725-9.719 2.596 0 5.033 1.01 6.867 2.847a9.655 9.655 0 012.853 6.866c0 5.364-4.361 9.719-9.721 9.719M20.519 3.445a11.575 11.575 0 00-7.403-2.67c-6.195 0-11.24 5.045-11.24 11.24 0 1.98.517 3.925 1.497 5.634L1.455 22.32l4.551-1.195a11.226 11.226 0 005.381 1.37h.004c6.195 0 11.24-5.045 11.24-11.24 0-3.003-1.17-5.828-3.116-7.811"/>
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a3.999 3.999 0 110-7.998 3.999 3.999 0 010 7.998zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881"/>
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7"/>
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
            style={{ border: 0, borderRadius: '12px' }}
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
                <WhatsAppIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-base font-semibold text-white">Escribir por WhatsApp</p>
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
            style={{ backgroundColor: "#1a1a1a" }}
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                <InstagramIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-base font-semibold text-white">Seguirnos en Instagram</p>
                <p className="text-sm text-white/80">@kataleyaflawers12</p>
              </div>
            </div>
            <ArrowRightIcon className="h-6 w-6 text-white transition-transform duration-300 group-hover:translate-x-1" />
          </a>

          {/* Separador */}
          <div className="flex items-center justify-center py-2">
            <span className="text-sm font-medium" style={{ color: "var(--color-dark)", opacity: 0.5 }}>
              o
            </span>
          </div>

          {/* Card de horario */}
          <div
            className="flex items-center justify-between rounded-xl border p-4"
            style={{
              backgroundColor: "var(--color-cream)",
              borderColor: "color-mix(in srgb, var(--color-accent) 20%, transparent)",
            }}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">🕐</span>
              <span className="text-sm font-medium" style={{ color: "var(--color-dark)" }}>
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
