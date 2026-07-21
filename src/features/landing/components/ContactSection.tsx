import { ArrowRight, Clock } from "lucide-react";
import Image from "next/image";
import { FaInstagram, FaWhatsapp } from "react-icons/fa";

import BusinessHoursBadge from "@/components/shared/BusinessHoursBadge";
import SectionHeader from "@/components/ui/SectionHeader";
import { BUSINESS } from "@/lib/constants";

export default function ContactSection() {
  return (
    <section
      id="contacto"
      className="relative scroll-mt-20 flex items-center justify-center px-4 py-20 sm:px-6 lg:px-8 lg:py-28"
    >
      {/* Fondo ambiental sutil; el scrim cream garantiza contraste del contenido */}
      <Image
        src="/contact-floral-texture.jpg"
        alt=""
        aria-hidden="true"
        fill
        sizes="100vw"
        className="object-cover"
        loading="lazy"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          backgroundColor: "color-mix(in srgb, var(--color-cream) 55%, transparent)",
        }}
      />

      <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        {/* Lado izquierdo - Mapa */}
        <div className="space-y-6">
          <SectionHeader
            subtitle="Atención cercana"
            title="Contáctanos"
            description="Estamos en Lima para crear el arreglo perfecto para ti"
            align="left"
          />

          <iframe
            src={BUSINESS.mapsEmbedUrl}
            width="100%"
            height="220"
            style={{ border: 0, borderRadius: "12px" }}
            title={`Mapa de ubicación de ${BUSINESS.name}`}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          />
        </div>

        {/* Lado derecho - Botones y horario */}
        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-3xl sm:text-4xl font-heading text-primary">
              ¿Listo para crear algo especial?
            </h3>
            <p className="text-base text-dark">
              Cuéntanos qué necesitas y lo hacemos realidad.
            </p>
          </div>

          {/* Botón WhatsApp */}
          <a
            href={BUSINESS.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between rounded-2xl p-4 transition-all duration-300 hover:opacity-95"
            style={{ backgroundColor: "var(--color-whatsapp)" }}
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                <FaWhatsapp size={24} className="text-white" />
              </div>
              <div>
                <p className="text-base font-semibold text-white">
                  Escribir por WhatsApp
                </p>
                <p className="text-sm text-white/80">+{BUSINESS.phone}</p>
              </div>
            </div>
            <ArrowRight className="h-6 w-6 text-white transition-transform duration-300 group-hover:translate-x-1" />
          </a>

          {/* Botón Instagram */}
          <a
            href={BUSINESS.instagram}
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
                <p className="text-sm text-white/80">{BUSINESS.instagramHandle}</p>
              </div>
            </div>
            <ArrowRight className="h-6 w-6 text-white transition-transform duration-300 group-hover:translate-x-1" />
          </a>

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
              <Clock className="h-5 w-5 shrink-0" style={{ color: "var(--color-accent)" }} />
              <span className="text-sm font-medium text-dark">
                {BUSINESS.hours.weekdays} · {BUSINESS.hours.time}
              </span>
            </div>
            <BusinessHoursBadge />
          </div>
        </div>
      </div>
    </section>
  );
}
