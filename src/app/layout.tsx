import type { Metadata } from "next";
import type React from "react";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Kataleya Flawers",
    template: "%s | Kataleya Flawers",
  },
  description:
    "Floristería en Lima con 32 años de experiencia en arreglos florales y orquídeas. Encargos para celebraciones, homenajes y regalos.",
  icons: {
    icon: "/favicon.png",
  },
  openGraph: {
    type: "website",
    locale: "es_PE",
    siteName: "Kataleya Flawers",
    title: "Kataleya Flawers — Floristería en Lima",
    description:
      "Floristería en Lima con 32 años de experiencia en arreglos florales y orquídeas. Encargos para celebraciones, homenajes y regalos.",
  },
  twitter: {
    card: "summary",
    title: "Kataleya Flawers — Floristería en Lima",
    description:
      "Floristería en Lima con 32 años de experiencia en arreglos florales y orquídeas.",
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
              description:
                "Floristería en Lima con 32 años de experiencia en arreglos florales y orquídeas.",
              url: "https://kataleyaflawers.com",
              telephone: "+51990051041",
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
              sameAs: ["https://instagram.com/kataleyaflawers12"],
            }),
          }}
        />
        <Navbar />
        {children}
        <WhatsAppFloat />
        <Footer />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
