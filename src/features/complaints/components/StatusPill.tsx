import type { ComplaintStatus } from '../types';

const COLOR: Record<ComplaintStatus, string> = {
  PENDIENTE: 'var(--color-secondary)',
  EN_PROCESO: 'var(--color-muted)',
  RESPONDIDO: 'var(--color-accent)',
};

const LABEL: Record<ComplaintStatus, string> = {
  PENDIENTE: 'Pendiente',
  EN_PROCESO: 'En proceso',
  RESPONDIDO: 'Respondido',
};

export default function StatusPill({ status }: { status: string }) {
  const key = status as ComplaintStatus;
  const color = COLOR[key] ?? 'var(--color-muted)';
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{
        color: 'var(--color-dark)',
        background: `color-mix(in srgb, ${color} 18%, var(--color-white))`,
        border: `1px solid color-mix(in srgb, ${color} 40%, transparent)`,
      }}
    >
      {LABEL[key] ?? status}
    </span>
  );
}
