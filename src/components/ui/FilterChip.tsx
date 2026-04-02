'use client';

interface FilterChipProps {
  label: string;
  onRemove: () => void;
}

export default function FilterChip({ label, onRemove }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="inline-flex items-center gap-1 px-3 py-1 rounded-full font-body text-xs font-medium transition-colors"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, var(--color-cream))',
        color: 'var(--color-primary)',
        border: '1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)',
      }}
    >
      {label}
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  );
}
