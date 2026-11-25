'use client';

import type { Category } from '@/features/catalog/types';

import AccordionSection from './AccordionSection';
import OptionTile from './OptionTile';

export default function CategoryAccordion({
  categories,
  selectedSlugs,
  availableCategorySlugs,
  onToggle,
}: {
  categories: Category[];
  selectedSlugs: Set<string>;
  availableCategorySlugs: Set<string>;
  onToggle: (slug: string) => void;
}) {
  if (categories.length === 0) return null;
  return (
    <AccordionSection title="Categoría">
      <div className="grid grid-cols-3 gap-2">
        {categories.map((category) => {
          const selected = selectedSlugs.has(category.slug);
          const disabled = !selected && !availableCategorySlugs.has(category.slug);
          return (
            <OptionTile key={category.slug} selected={selected} disabled={disabled}>
              <input
                type="checkbox"
                name="categoria"
                value={category.slug}
                checked={selected}
                disabled={disabled}
                onChange={() => onToggle(category.slug)}
                className="sr-only"
              />
              <span>{category.name}</span>
            </OptionTile>
          );
        })}
      </div>
    </AccordionSection>
  );
}
