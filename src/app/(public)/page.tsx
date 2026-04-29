import { getCategories } from "@/features/catalog/queries/getCategories";
import AboutSection from "@/features/landing/components/AboutSection";
import CatalogSection from "@/features/landing/components/CatalogSection";
import ContactSection from "@/features/landing/components/ContactSection";
import HeroSection from "@/features/landing/components/HeroSection";
import TestimonialsSection from "@/features/landing/components/TestimonialsSection";

export default async function Home() {
  const categories = await getCategories();

  return (
    <main id="main-content">
      <HeroSection />
      <CatalogSection categories={categories} />
      <TestimonialsSection />
      <AboutSection />
      <ContactSection />
    </main>
  );
}
