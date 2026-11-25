'use client';

import AccordionSection from './AccordionSection';

function formatPeruvianSoles(value: number): string {
  return value.toLocaleString('es-PE', {
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

export default function PriceAccordion({
  maximumPrice,
  priceMinDraft,
  priceMaxDraft,
  onPriceMinDraftChange,
  onPriceMaxDraftChange,
  onReset,
}: {
  maximumPrice: number;
  priceMinDraft: string;
  priceMaxDraft: string;
  onPriceMinDraftChange: (value: string) => void;
  onPriceMaxDraftChange: (value: string) => void;
  onReset: () => void;
}) {
  return (
    <AccordionSection title="Precio" defaultOpen>
      <p className="mb-3 font-body text-sm text-(--color-dark)">
        El precio más alto es S/ {formatPeruvianSoles(maximumPrice)}{' '}
        <button
          type="button"
          onClick={onReset}
          className="inline-block px-2 py-2 font-semibold text-(--color-muted) underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-primary)"
        >
          Restablecer
        </button>
      </p>
      <div className="grid grid-cols-2 gap-3">
        <label className="block rounded-lg border border-(--color-border) bg-(--color-cream) px-3 py-2 font-body text-sm focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-(--color-primary)">
          <span className="block text-[10px] font-semibold uppercase tracking-wide text-(--color-muted)">
            Desde
          </span>
          <span className="flex items-center gap-1">
            <span className="text-(--color-muted)">S/</span>
            <input
              type="number"
              inputMode="decimal"
              name="priceMin"
              autoComplete="off"
              min={0}
              max={maximumPrice}
              value={priceMinDraft}
              onChange={(event) => onPriceMinDraftChange(event.target.value)}
              className="w-full bg-transparent text-base focus:outline-none"
            />
          </span>
        </label>
        <label className="block rounded-lg border border-(--color-border) bg-(--color-cream) px-3 py-2 font-body text-sm focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-(--color-primary)">
          <span className="block text-[10px] font-semibold uppercase tracking-wide text-(--color-muted)">
            Hasta
          </span>
          <span className="flex items-center gap-1">
            <span className="text-(--color-muted)">S/</span>
            <input
              type="number"
              inputMode="decimal"
              name="priceMax"
              autoComplete="off"
              min={0}
              max={maximumPrice}
              value={priceMaxDraft}
              onChange={(event) => onPriceMaxDraftChange(event.target.value)}
              className="w-full bg-transparent text-base focus:outline-none"
            />
          </span>
        </label>
      </div>
    </AccordionSection>
  );
}
