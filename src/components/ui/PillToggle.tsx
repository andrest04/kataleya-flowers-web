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

  const inactiveStyle: React.CSSProperties = {
    backgroundColor: 'var(--color-surface)',
    color: 'var(--color-dark)',
    border: '1px solid var(--color-border)',
  };

  // For non-filled inactive, use white bg (admin form style)
  const inactiveStyleAlt: React.CSSProperties = {
    background: 'var(--color-white)',
    color: 'var(--color-dark)',
    border: '1px solid var(--color-border)',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${className}`}
      style={active ? activeStyle : (filled ? inactiveStyle : inactiveStyleAlt)}
    >
      {icon}
      {label}
    </button>
  );
}
