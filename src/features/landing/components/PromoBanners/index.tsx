import { BUSINESS } from '@/lib/constants';

import PromoBannerCard from './PromoBannerCard';

const BANNERS = [
  {
    imageSrc: '/images/hero/peonias.jpg',
    heading: 'Entrega el mismo día en Lima',
    description:
      'Pedidos confirmados a tiempo llegan el mismo día, directo a la puerta de quien más quieres.',
    cta: {
      label: 'Pedir por WhatsApp',
      href: BUSINESS.whatsappWithMessage(BUSINESS.messages.whatsappDefault),
      external: true,
      variant: 'whatsapp' as const,
    },
  },
  {
    imageSrc: '/images/hero/gerberas.jpg',
    heading: 'Arreglos para toda ocasión',
    description:
      'Cumpleaños, aniversarios, condolencias — flores frescas diseñadas para cada momento.',
    cta: {
      label: 'Ver catálogo',
      href: '/catalogo',
      variant: 'primary' as const,
    },
  },
];

export default function PromoBanners() {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
          {BANNERS.map((banner) => (
            <PromoBannerCard key={banner.heading} {...banner} />
          ))}
        </div>
      </div>
    </section>
  );
}
