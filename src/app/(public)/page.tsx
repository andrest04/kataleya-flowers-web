import { getCategories } from "@/features/catalog/queries/getCategories";
import BestSellersSection from "@/features/landing/components/BestSellersSection";
import CatalogSection from "@/features/landing/components/CatalogSection";
import ContactSection from "@/features/landing/components/ContactSection";
import DiscoverMoreSection from "@/features/landing/components/DiscoverMoreSection";
import HeroSection from "@/features/landing/components/HeroSection";
import PromoBanners from "@/features/landing/components/PromoBanners";
import TestimonialsSection from "@/features/landing/components/TestimonialsSection";

export default async function Home() {
  const categories = await getCategories();

  return (
    <main id="main-content">
      <HeroSection />
      <CatalogSection categories={categories} />
      <TestimonialsSection />
      <PromoBanners />
      <BestSellersSection categories={categories} />
      <DiscoverMoreSection />
      <ContactSection />
    </main>
  );
}
