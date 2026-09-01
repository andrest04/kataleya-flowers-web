'use client';

interface PillToggleProps {
  label: string;
  active: boolean;
  onClick: () => void;
  activeColor?: 'primary' | 'accent';
  filled?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

const inactiveStyle: React.CSSProperties = {
  backgroundColor: 'var(--color-surface)',
  color: 'var(--color-dark)',
  border: '1px solid var(--color-border)',
};

const inactiveStyleAlt: React.CSSProperties = {
  background: 'var(--color-white)',
  color: 'var(--color-dark)',
  border: '1px solid var(--color-border)',
};

export default function PillToggle({
  label,
  active,
  onClick,
  activeColor = 'primary',
  filled = false,
  icon,
  className = '',
}: PillToggleProps) {
  const colorVar = `var(--color-${activeColor})`;

  const activeStyle: React.CSSProperties = filled
    ? { backgroundColor: colorVar, color: 'var(--color-white)', border: `1px solid ${colorVar}` }
    : { background: `color-mix(in srgb, ${colorVar} 10%, transparent)`, color: colorVar, border: `1px solid ${colorVar}` };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-primary) ${className}`}
      style={active ? activeStyle : (filled ? inactiveStyle : inactiveStyleAlt)}
    >
      {icon}
      {label}
    </button>
  );
}
