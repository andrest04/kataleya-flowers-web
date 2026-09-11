import "./globals.css";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata, Viewport } from "next";
import { Crimson_Text, Mulish } from "next/font/google";
import type React from "react";

import { MotionProvider } from "@/components/shared/MotionProvider";
import { JsonLd } from "@/components/ui/JsonLd";
import { Toaster } from "@/components/ui/primitives/sonner";
import { getSiteSettings } from "@/features/settings/queries/getSiteSettings";
import { floristSeoDescription, schemaDayNames } from "@/lib/siteSettings";

const crimsonText = Crimson_Text({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
  variable: "--font-heading",
});

const mulish = Mulish({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-body",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const description = floristSeoDescription(settings);

  return {
    metadataBase: new URL(settings.website),
    title: {
      default: `${settings.name} | Floristería en ${settings.location}`,
      template: `%s | ${settings.name}`,
    },
    description,
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
      siteName: settings.name,
      title: `${settings.name} — Floristería en ${settings.location}`,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: `${settings.name} — Floristería en ${settings.location}`,
      description,
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#c0392b",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();
  const floristJsonLd = {
    "@context": "https://schema.org",
    "@type": "Florist",
    name: settings.name,
    description: floristSeoDescription(settings),
    url: settings.website,
    telephone: `+${settings.phone}`,
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.address,
      addressLocality: settings.location,
      addressCountry: "PE",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: schemaDayNames(settings.hours.openDays),
        opens: settings.hours.opens,
        closes: settings.hours.closes,
      },
    ],
    sameAs: [settings.instagram],
    priceRange: "S/30 — S/800",
  };

  return (
    <html lang="es-PE" className={`${crimsonText.variable} ${mulish.variable}`}>
      <head>
        <JsonLd data={floristJsonLd} />
      </head>
      <body className="antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:bg-(--color-primary) focus:text-(--color-white) focus:px-4 focus:py-2 focus:rounded focus:font-body focus:text-sm focus:font-medium focus:outline-2 focus:outline-(--color-primary)"
          style={{ zIndex: 200 }}
        >
          Saltar al contenido principal
        </a>
        <MotionProvider>{children}</MotionProvider>
        <Toaster />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
