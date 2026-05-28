import type { ComplaintType } from '../types';

const STYLES: Record<ComplaintType, string> = {
  RECLAMO: 'var(--color-primary)',
  QUEJA: 'var(--color-accent)',
};

export default function ComplaintTypeBadge({ type }: { type: string }) {
  const color = STYLES[type as ComplaintType] ?? 'var(--color-muted)';
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{
        color,
        background: `color-mix(in srgb, ${color} 12%, var(--color-white))`,
        border: `1px solid color-mix(in srgb, ${color} 35%, transparent)`,
      }}
    >
      {type}
    </span>
  );
}
