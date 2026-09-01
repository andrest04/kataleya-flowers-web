import { getCategories } from "@/features/catalog/queries/getCategories";
import BestSellersSection from "@/features/landing/components/BestSellersSection";
import CatalogSection from "@/features/landing/components/CatalogSection";
import ContactSection from "@/features/landing/components/ContactSection";
import DiscoverMoreSection from "@/features/landing/components/DiscoverMoreSection";
import HeroSection from "@/features/landing/components/HeroSection";
import PromoBanners from "@/features/landing/components/PromoBanners";
import TestimonialsSection from "@/features/landing/components/TestimonialsSection";
import { getSiteSettings } from "@/features/settings/queries/getSiteSettings";

export default async function Home() {
  const [categories, settings] = await Promise.all([
    getCategories(),
    getSiteSettings(),
  ]);

  return (
    <main id="main-content">
      <HeroSection />
      <CatalogSection categories={categories} title={settings.titles.catalog} />
      <TestimonialsSection location={settings.location} />
      <PromoBanners />
      <BestSellersSection categories={categories} />
      <DiscoverMoreSection title={settings.titles.discover} />
      <ContactSection settings={settings} />
    </main>
  );
}
