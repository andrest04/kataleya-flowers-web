'use client';

import AccordionSection from './AccordionSection';
import OptionTile from './OptionTile';

export default function FlowerTypeAccordion({
  flowerTypes,
  selectedTypes,
  availableFlowerTypes,
  onToggle,
}: {
  flowerTypes: string[];
  selectedTypes: Set<string>;
  availableFlowerTypes: Set<string>;
  onToggle: (flowerType: string) => void;
}) {
  if (flowerTypes.length === 0) return null;
  return (
    <AccordionSection title="Tipo de flor">
      <div className="grid grid-cols-3 gap-2">
        {flowerTypes.map((flowerType) => {
          const selected = selectedTypes.has(flowerType);
          const disabled = !selected && !availableFlowerTypes.has(flowerType);
          return (
            <OptionTile key={flowerType} selected={selected} disabled={disabled}>
              <input
                type="checkbox"
                name="tipo"
                value={flowerType}
                checked={selected}
                disabled={disabled}
                onChange={() => onToggle(flowerType)}
                className="sr-only"
              />
              <span>{flowerType}</span>
            </OptionTile>
          );
        })}
      </div>
    </AccordionSection>
  );
}
