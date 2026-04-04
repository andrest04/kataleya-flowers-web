import type {
  AnalyticsSummary,
  ZeroWhatsAppProductInsightSummary,
} from '@/features/admin/queries/analytics';
import type { ActionableKpis } from '@/features/admin/queries/dashboard';

export type DashboardInsightTone = 'high' | 'attention' | 'opportunity';

export interface DashboardInsight {
  id:
    | 'featured-without-views'
    | 'active-without-views'
    | 'categories-without-active-products'
    | 'active-without-additional-images'
    | 'product-interest-without-whatsapp'
    | 'interest-without-contact';
  title: string;
  message: string;
  tone: DashboardInsightTone;
}

interface GetDashboardInsightsInput {
  actionableKpis: ActionableKpis;
  analyticsSummary: AnalyticsSummary;
  zeroWhatsAppProductInsight: ZeroWhatsAppProductInsightSummary;
}

export function getDashboardInsights({
  actionableKpis,
  analyticsSummary,
  zeroWhatsAppProductInsight,
}: GetDashboardInsightsInput): DashboardInsight[] {
  const periodLabel = `en los últimos ${analyticsSummary.periodDays} días`;
  const insights: DashboardInsight[] = [];

  if (actionableKpis.featuredWithoutViews > 0) {
    insights.push({
      id: 'featured-without-views',
      title: 'Destacados sin exposición',
      message: `${actionableKpis.featuredWithoutViews} producto${actionableKpis.featuredWithoutViews === 1 ? '' : 's'} destacado${actionableKpis.featuredWithoutViews === 1 ? '' : 's'} no recibió vistas ${periodLabel}. Conviene revisar su ubicación y visibilidad en portada o catálogo.`,
      tone: 'high',
    });
  }

  if (actionableKpis.activeWithoutViews > 0) {
    insights.push({
      id: 'active-without-views',
      title: 'Productos activos sin tráfico',
      message: `${actionableKpis.activeWithoutViews} producto${actionableKpis.activeWithoutViews === 1 ? '' : 's'} activo${actionableKpis.activeWithoutViews === 1 ? '' : 's'} no recibió vistas ${periodLabel}. Vale la pena revisar naming, fotos o su ubicación dentro del catálogo.`,
      tone: 'attention',
    });
  }

  if (actionableKpis.categoriesWithoutActiveProducts > 0) {
    insights.push({
      id: 'categories-without-active-products',
      title: 'Categorías hoy vacías',
      message: `${actionableKpis.categoriesWithoutActiveProducts} categor${actionableKpis.categoriesWithoutActiveProducts === 1 ? 'ía quedó' : 'ías quedaron'} sin productos activos. Eso debilita la oferta pública y puede cortar recorridos dentro del catálogo.`,
      tone: 'attention',
    });
  }

  if (actionableKpis.activeWithoutAdditionalImages > 0) {
    insights.push({
      id: 'active-without-additional-images',
      title: 'Galerías por completar',
      message: `${actionableKpis.activeWithoutAdditionalImages} producto${actionableKpis.activeWithoutAdditionalImages === 1 ? '' : 's'} activo${actionableKpis.activeWithoutAdditionalImages === 1 ? '' : 's'} no tiene imágenes adicionales. Una galería más completa puede mejorar la confianza y la conversión.`,
      tone: 'opportunity',
    });
  }

  if (zeroWhatsAppProductInsight.productsWithoutClicks > 0) {
    insights.push({
      id: 'product-interest-without-whatsapp',
      title: 'Interés sin contacto desde ficha',
      message: `Hay ${zeroWhatsAppProductInsight.productsWithoutClicks} producto${zeroWhatsAppProductInsight.productsWithoutClicks === 1 ? '' : 's'} con al menos ${zeroWhatsAppProductInsight.minimumViews} vista${zeroWhatsAppProductInsight.minimumViews === 1 ? '' : 's'} y cero clics a WhatsApp desde su ficha ${periodLabel}. Conviene revisar fotos, precio, copy o la claridad del CTA.`,
      tone: 'attention',
    });
  }

  if (
    analyticsSummary.totalWhatsAppClicks === 0
    && analyticsSummary.totalProductViews > 0
    && zeroWhatsAppProductInsight.productsWithoutClicks === 0
  ) {
    insights.push({
      id: 'interest-without-contact',
      title: 'Hay interés, pero no contacto',
      message: `Se registraron ${analyticsSummary.totalProductViews} vista${analyticsSummary.totalProductViews === 1 ? '' : 's'} de producto ${periodLabel}, pero ningún clic a WhatsApp. Conviene revisar la claridad del llamado a la acción y la fricción para contactar.`,
      tone: 'high',
    });
  }

  return insights.slice(0, 5);
}
