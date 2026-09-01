export type PromoBannerCtaType = 'whatsapp' | 'catalogo' | 'url';

export interface PromoBannerDraft {
  contentPosition: 'top' | 'bottom';
  ctaLabel: string;
  ctaType: PromoBannerCtaType;
  ctaValue: string;
  description: string;
  endsAt: string;
  imageUrl: string;
  isActive: boolean;
  name: string;
  startsAt: string;
  title: string;
}
