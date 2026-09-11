import { getPublishedValueProps } from '@/features/landing/queries/getPublishedValueProps';

import { valuePropIcon } from './icons';
import ValuePropCard from './ValuePropCard';

function bandColumns(count: number): string {
  if (count <= 1) return 'grid-cols-1';
  if (count === 2) return 'grid-cols-1 md:grid-cols-2';
  return 'grid-cols-1 md:grid-cols-3';
}

export default async function ValuePropsBand({ brandName }: { brandName: string }) {
  const items = await getPublishedValueProps();
  if (items.length === 0) return null;

  return (
    <section
      aria-label={`Sobre ${brandName}`}
      className="border-t border-(--color-primary) text-(--color-dark)"
    >
      <div className={`grid ${bandColumns(items.length)}`}>
        {items.map((item) => (
          <ValuePropCard
            key={item.id}
            Icon={valuePropIcon(item.icon)}
            description={item.description}
            href={item.href}
            isAnchor={item.isAnchor}
            isExternal={item.isExternal}
            linkLabel={item.linkLabel}
            title={item.title}
          />
        ))}
      </div>
    </section>
  );
}
