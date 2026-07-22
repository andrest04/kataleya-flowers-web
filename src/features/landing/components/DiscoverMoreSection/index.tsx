import { MessageCircle, ShieldCheck, Truck } from 'lucide-react';

import SectionHeader from '@/components/ui/SectionHeader';
import { BUSINESS } from '@/lib/constants';

import EditorialTile from './EditorialTile';

const ITEMS = [
  {
    imageSrc: '/images/hero/rosas.jpg',
    Icon: Truck,
    title: 'Entrega el mismo día',
    description: `Pedidos a tiempo llegan el mismo día en ${BUSINESS.location}.`,
    href: '/#contacto',
  },
  {
    imageSrc: '/about-florist-table.jpg',
    Icon: MessageCircle,
    title: 'Pide por WhatsApp',
    description: 'Atención personalizada, de principio a fin, por WhatsApp.',
    href: BUSINESS.whatsappWithMessage(BUSINESS.messages.whatsappDefault),
    external: true,
  },
  {
    imageSrc: '/contact-floral-texture.jpg',
    Icon: ShieldCheck,
    title: 'Reclamos y garantía',
    description: 'Libro de Reclamaciones a tu disposición, como manda la ley.',
    href: '/libro-de-reclamaciones',
  },
];

/**
 * Grid editorial de 3 propuestas de valor reales de Kataleya — sin inventar
 * servicios que el negocio no ofrece (nada de "suscripciones" ni "diseño a
 * medida" estilo e-commerce grande).
 */
export default function DiscoverMoreSection() {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-10">
        <SectionHeader align="left" subtitle="Más sobre nosotros" title="Descubre Kataleya" />
        <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-6">
          {ITEMS.map((item) => (
            <EditorialTile key={item.title} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
}
