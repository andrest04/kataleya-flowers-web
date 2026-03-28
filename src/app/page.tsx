import AboutSection from "@/features/landing/components/AboutSection";
import CatalogSection from "@/features/landing/components/CatalogSection";
import ContactSection from "@/features/landing/components/ContactSection";
import HeroSection from "@/features/landing/components/HeroSection";
import TestimonialsSection from "@/features/landing/components/TestimonialsSection";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <CatalogSection />
      <TestimonialsSection />
      <AboutSection />
      <ContactSection />
    </main>
  );
}
