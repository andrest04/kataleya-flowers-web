import AboutSection from "@/components/sections/AboutSection";
import CatalogSection from "@/components/sections/CatalogSection";
import ContactSection from "@/components/sections/ContactSection";
import HeroSection from "@/components/sections/HeroSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";

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
