import type { ReactNode } from "react";
import { Suspense } from "react";

import Footer from "@/components/shared/Footer";
import Navbar from "@/components/shared/Navbar";
import ValuePropsBand from "@/components/shared/ValuePropsBand";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Suspense fallback={<div className="h-16" />}>
        <Navbar />
      </Suspense>
      {children}
      <ValuePropsBand />
      <Footer />
    </>
  );
}
