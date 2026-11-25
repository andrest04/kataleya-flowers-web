'use client';

import AccordionSection from './AccordionSection';
import OptionTile from './OptionTile';
import type { CatalogColorFacet } from './types';

export default function ColorAccordion({
  colors,
  selectedNames,
  availableColors,
  onToggle,
}: {
  colors: CatalogColorFacet[];
  selectedNames: Set<string>;
  availableColors: Set<string>;
  onToggle: (name: string) => void;
}) {
  if (colors.length === 0) return null;
  return (
    <AccordionSection title="Color">
      <div className="grid grid-cols-3 gap-2">
        {colors.map((color) => {
          const selected = selectedNames.has(color.name);
          const disabled = !selected && !availableColors.has(color.name);
          return (
            <OptionTile key={color.name} selected={selected} disabled={disabled}>
              <input
                type="checkbox"
                name="color"
                value={color.name}
                checked={selected}
                disabled={disabled}
                onChange={() => onToggle(color.name)}
                className="sr-only"
              />
              {color.hex && (
                <span
                  aria-hidden="true"
                  className="size-4 rounded-full border border-(--color-border)"
                  style={{ backgroundColor: color.hex }}
                />
              )}
              <span>{color.label}</span>
            </OptionTile>
          );
        })}
      </div>
    </AccordionSection>
  );
}
