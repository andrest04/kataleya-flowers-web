"use client";

import { domAnimation, LazyMotion, m } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";

import { BUSINESS } from "@/lib/constants";

export default function WhatsAppFloat() {
  const href = BUSINESS.whatsappWithMessage(BUSINESS.messages.whatsappFloat);

  return (
    <LazyMotion features={domAnimation}>
      <div className="fixed bottom-6 right-6 z-50 group">
        {/* Tooltip */}
        <span
          className="
            absolute bottom-full right-0 mb-2
            px-3 py-1 rounded-md
            text-sm font-medium whitespace-nowrap
            opacity-0 group-hover:opacity-100
            pointer-events-none
            transition-opacity duration-200
          "
          style={{
            backgroundColor: "var(--color-dark)",
            color: "var(--color-cream)",
          }}
          role="tooltip"
        >
          Pedir por WhatsApp
        </span>

        {/* Pulse ring */}
        <span
          className="absolute inset-0 rounded-full animate-pulse motion-reduce:animate-none"
          style={{ backgroundColor: "var(--color-whatsapp)", opacity: 0.35 }}
          aria-hidden="true"
        />

        {/* Button */}
        <m.a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contactar por WhatsApp"
          className="
            relative flex items-center justify-center
            w-14 h-14 md:w-16 md:h-16
            rounded-full shadow-lg
            focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
          "
          style={{ backgroundColor: "var(--color-whatsapp)" }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaWhatsapp
            className="w-7 h-7 md:w-8 md:h-8 text-white"
            aria-hidden="true"
          />
        </m.a>
      </div>
    </LazyMotion>
  );
}
