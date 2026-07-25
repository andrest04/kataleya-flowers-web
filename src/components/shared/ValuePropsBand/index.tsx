import { Flower, Flower2, Sprout } from 'lucide-react';

import { BUSINESS } from '@/lib/constants';

import type { ValueProp } from './ValuePropCard';
import ValuePropCard from './ValuePropCard';

const ITEMS: ValueProp[] = [
  {
    Icon: Flower2,
    title: `${BUSINESS.experience} años floreciendo`,
    description: `Tres décadas armando arreglos para las familias de ${BUSINESS.location}.`,
    linkLabel: 'Conoce la historia',
    href: '#nosotros',
    isAnchor: true,
  },
  {
    Icon: Sprout,
    title: 'Siempre abiertos',
    description: `${BUSINESS.hours.weekdays}, de ${BUSINESS.hours.time}, en ${BUSINESS.address}.`,
    linkLabel: 'Ver ubicación',
    href: '#contacto',
    isAnchor: true,
  },
  {
    Icon: Flower,
    title: 'Míranos en Instagram',
    description: `Publicamos cada ramo que sale de la tienda en ${BUSINESS.instagramHandle}.`,
    linkLabel: 'Ver Instagram',
    href: BUSINESS.instagram,
    isExternal: true,
  },
];

export default function ValuePropsBand() {
  return (
    <section
      aria-label={`Sobre ${BUSINESS.name}`}
      className="border-t border-(--color-primary) text-(--color-dark)"
    >
      <div className="grid grid-cols-1 md:grid-cols-3">
        {ITEMS.map((item) => (
          <ValuePropCard key={item.title} {...item} />
        ))}
      </div>
    </section>
  );
}
