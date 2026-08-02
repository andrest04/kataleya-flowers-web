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
    title: 'Pedir por WhatsApp',
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

export default function DiscoverMoreSection() {
  return (
    <section id="nosotros" className="scroll-mt-20 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[90rem] space-y-10">
        <SectionHeader align="left" title="Descubre Kataleya" />
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-3 md:gap-10">
          {ITEMS.map((item) => (
            <EditorialTile key={item.title} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
}
