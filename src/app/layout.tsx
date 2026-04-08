import type { Metadata } from "next";
import type React from "react";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { BUSINESS } from "@/lib/constants";
import { Toaster } from "@/components/ui/primitives/sonner";

import "./globals.css";

const baseDescription = `Floristería en Lima con ${BUSINESS.experience} años de experiencia en arreglos florales y orquídeas. Encargos para celebraciones, homenajes y regalos.`;

export const metadata: Metadata = {
  title: {
    default: BUSINESS.name,
    template: `%s | ${BUSINESS.name}`,
  },
  description: baseDescription,
  icons: {
    icon: "/favicon.png",
  },
  openGraph: {
    type: "website",
    locale: "es_PE",
    siteName: BUSINESS.name,
    title: `${BUSINESS.name} — Floristería en ${BUSINESS.location}`,
    description: baseDescription,
  },
  twitter: {
    card: "summary",
    title: `${BUSINESS.name} — Floristería en ${BUSINESS.location}`,
    description: `Floristería en ${BUSINESS.location} con ${BUSINESS.experience} años de experiencia en arreglos florales y orquídeas.`,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
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
