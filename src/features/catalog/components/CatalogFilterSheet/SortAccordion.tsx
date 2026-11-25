'use client';

import type { Ref } from 'react';

import AccordionSection from './AccordionSection';
import OptionTile from './OptionTile';
import type { CatalogSortOption } from './types';

const SORT_LABELS: Record<CatalogSortOption, string> = {
  featured: 'Selección Kataleya',
  'price-asc': 'Precio: menor a mayor',
  'price-desc': 'Precio: mayor a menor',
  'name-asc': 'Nombre: A–Z',
};

export default function SortAccordion({
  sortOption,
  onSelect,
  sectionRef,
}: {
  sortOption: CatalogSortOption;
  onSelect: (option: CatalogSortOption) => void;
  sectionRef: Ref<HTMLDetailsElement>;
}) {
  return (
    <AccordionSection ref={sectionRef} title="Ordenar por:" subtitle={SORT_LABELS[sortOption]}>
      <div className="grid grid-cols-3 gap-2">
        {(Object.keys(SORT_LABELS) as CatalogSortOption[]).map((option) => {
          const selected = sortOption === option;
          return (
            <OptionTile key={option} selected={selected}>
              <input
                type="radio"
                name="orden"
                value={option}
                checked={selected}
                onChange={() => onSelect(option)}
                className="sr-only"
              />
              <span>{SORT_LABELS[option]}</span>
            </OptionTile>
          );
        })}
      </div>
    </AccordionSection>
  );
}
