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
    default: "Kataleya Flawers",
    template: "%s | Kataleya Flawers",
  },
  description: baseDescription,
  icons: {
    icon: "/favicon.png",
  },
  openGraph: {
    type: "website",
    locale: "es_PE",
    siteName: "Kataleya Flawers",
    title: "Kataleya Flawers — Floristería en Lima",
    description: baseDescription,
  },
  twitter: {
    card: "summary",
    title: "Kataleya Flawers — Floristería en Lima",
    description: `Floristería en Lima con ${BUSINESS.experience} años de experiencia en arreglos florales y orquídeas.`,
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
              name: "Kataleya Flawers",
              description: `Floristería en Lima con ${BUSINESS.experience} años de experiencia en arreglos florales y orquídeas.`,
              url: "https://kataleyaflawers.com",
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
                  opens: "08:00",
                  closes: "19:00",
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
