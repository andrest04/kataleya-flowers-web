import AboutSection from "@/components/sections/AboutSection";
import CatalogSection from "@/components/sections/CatalogSection";
import ContactSection from "@/components/sections/ContactSection";
import DeliverySection from "@/components/sections/DeliverySection";
import HeroSection from "@/components/sections/HeroSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import TrustBar from "@/components/sections/TrustBar";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <TrustBar />
      <CatalogSection />
      <TestimonialsSection />
      <DeliverySection />
      <ContactSection />
      <AboutSection />
    </main>
  );
}
