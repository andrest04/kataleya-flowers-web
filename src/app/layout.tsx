import type { Metadata, Viewport } from "next";
import type React from "react";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Lato, Playfair_Display } from "next/font/google";

import { BUSINESS } from "@/lib/constants";
import { Toaster } from "@/components/ui/primitives/sonner";

import "./globals.css";

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
  metadataBase: new URL("https://kataleya-flawers.vercel.app"),
  // TODO Fase 4: las páginas hijas duplican el suffix — quitar BUSINESS.name de generateMetadata por página
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
      <body className="antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Florist",
              name: BUSINESS.name,
              description: `Floristería en ${BUSINESS.location} con ${BUSINESS.experience} años de experiencia en arreglos florales y orquídeas.`,
              url: BUSINESS.website,
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
            }),
          }}
        />
        {children}
        <Toaster />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
