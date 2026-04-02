interface StatusBadgeProps {
  active: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
}

export default function StatusBadge({
  active,
  activeLabel = 'Activo',
  inactiveLabel = 'Inactivo',
}: StatusBadgeProps) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
      style={{
        background: active
          ? 'color-mix(in srgb, var(--color-accent) 15%, transparent)'
          : 'color-mix(in srgb, var(--color-muted) 15%, transparent)',
        color: active ? 'var(--color-accent)' : 'var(--color-muted)',
      }}
    >
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}
