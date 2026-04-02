import AboutSection from "@/features/landing/components/AboutSection";
import CatalogSection from "@/features/landing/components/CatalogSection";
import ContactSection from "@/features/landing/components/ContactSection";
import HeroSection from "@/features/landing/components/HeroSection";
import TestimonialsSection from "@/features/landing/components/TestimonialsSection";
import { getCategories } from "@/features/catalog/queries/getCategories";

export default async function Home() {
  const categories = await getCategories();

  return (
    <main>
      <HeroSection />
      <CatalogSection categories={categories} />
      <TestimonialsSection />
      <AboutSection />
      <ContactSection />
    </main>
  );
}
