import AboutSection from "@/components/sections/AboutSection";
import CatalogSection from "@/components/sections/CatalogSection";
import ContactSection from "@/components/sections/ContactSection";
import HeroSection from "@/components/sections/HeroSection";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <CatalogSection />
      <AboutSection />
      <ContactSection />
    </main>
  );
}
