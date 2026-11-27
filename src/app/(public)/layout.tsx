import { GoogleAnalytics } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { ReactNode } from "react";
import { Suspense } from "react";

import Footer from "@/components/shared/Footer";
import Navbar from "@/components/shared/Navbar";
import WhatsAppFloat from "@/components/shared/WhatsAppFloat";
import { getSiteSettings } from "@/features/settings/queries/getSiteSettings";
import { GA_MEASUREMENT_ID } from "@/lib/constants";

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const settings = await getSiteSettings();
  const isProduction = process.env.VERCEL_ENV === "production";

  return (
    <>
      <Suspense fallback={<div className="h-16" />}>
        <Navbar settings={settings} />
      </Suspense>
      {children}
      <Footer settings={settings} />
      <WhatsAppFloat settings={settings} />
      <Analytics />
      <SpeedInsights />
      {isProduction ? <GoogleAnalytics gaId={GA_MEASUREMENT_ID} /> : null}
    </>
  );
}
