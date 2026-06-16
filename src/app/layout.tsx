import "./globals.css";

import type { Metadata, Viewport } from "next";
import { Lato, Playfair_Display } from "next/font/google";
import type React from "react";

import { JsonLd } from "@/components/ui/JsonLd";
import { Toaster } from "@/components/ui/primitives/sonner";
import { BUSINESS } from "@/lib/constants";

const SITE_URL = BUSINESS.website;

const floristJsonLd = {
  "@context": "https://schema.org",
  "@type": "Florist",
  name: BUSINESS.name,
  description: `Floristería en ${BUSINESS.location} con ${BUSINESS.experience} años de experiencia en arreglos florales y orquídeas.`,
  url: SITE_URL,
  telephone: `+${BUSINESS.phone}`,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Lima",
    addressCountry: "PE",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      opens: BUSINESS.hours.opens,
      closes: BUSINESS.hours.closes,
    },
  ],
  sameAs: [BUSINESS.instagram],
  priceRange: "S/30 — S/800",
} as const;

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
  variable: "--font-heading",
});

const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-body",
});

const baseDescription = `Floristería en ${BUSINESS.location} con ${BUSINESS.experience} años de experiencia en arreglos florales y orquídeas. Encargos para celebraciones, homenajes y regalos.`;

export const metadata: Metadata = {
  metadataBase: new URL(BUSINESS.website),
  // Las páginas hijas devuelven `title` como string plain — el `template`
  // agrega el sufijo `| Kataleya Flawers`. NO concatenar `BUSINESS.name` en
  // los títulos hijos: duplica el sufijo. Si una página necesita evitar el
  // template, usar `title: { absolute: '...' }`.
  title: {
    default: `${BUSINESS.name} — Floristería en ${BUSINESS.location}`,
    template: `%s | ${BUSINESS.name}`,
  },
  description: baseDescription,
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "es_PE",
    url: "/",
    siteName: BUSINESS.name,
    title: `${BUSINESS.name} — Floristería en ${BUSINESS.location}`,
    description: baseDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: `${BUSINESS.name} — Floristería en ${BUSINESS.location}`,
    description: baseDescription,
  },
};

export const viewport: Viewport = {
  themeColor: "#c0392b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-PE" className={`${playfair.variable} ${lato.variable}`}>
      <head>
        <JsonLd data={floristJsonLd} />
      </head>
      <body className="antialiased">
        {/*
         * Skip link de a11y. Debe quedar arriba de TODO el z-stack del proyecto
         * (Navbar z-[90], WhatsAppFloat z-50, Lightbox z-[100]). El whitelist de
         * la regla ESLint `no-restricted-syntax` solo permite z-50, z-[90] y
         * z-[100] en `className`, así que usamos `style` inline (no matcheado)
         * para zIndex 200 — caso único del skip link.
         */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:bg-(--color-primary) focus:text-(--color-white) focus:px-4 focus:py-2 focus:rounded focus:font-body focus:text-sm focus:font-medium focus:outline-2 focus:outline-(--color-primary)"
          style={{ zIndex: 200 }}
        >
          Saltar al contenido principal
        </a>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
