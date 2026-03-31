import type { ReactNode } from "react";
import { Suspense } from "react";

import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import WhatsAppFloat from "@/components/shared/WhatsAppFloat";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Suspense fallback={<div className="h-16" />}>
        <Navbar />
      </Suspense>
      {children}
      <WhatsAppFloat />
      <Footer />
    </>
  );
}
