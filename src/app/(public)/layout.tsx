import type { ReactNode } from "react";
import { Suspense } from "react";

import Footer from "@/components/shared/Footer";
import Navbar from "@/components/shared/Navbar";
import ValuePropsBand from "@/components/shared/ValuePropsBand";
import { getSiteSettings } from "@/features/settings/queries/getSiteSettings";

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const settings = await getSiteSettings();

  return (
    <>
      <Suspense fallback={<div className="h-16" />}>
        <Navbar settings={settings} />
      </Suspense>
      {children}
      <ValuePropsBand />
      <Footer settings={settings} />
    </>
  );
}
