'use client';

interface ToggleSwitchProps {
  checked: boolean;
  disabled?: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}

export default function ToggleSwitch({
  checked,
  disabled = false,
  label,
  onChange,
}: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 disabled:opacity-50"
      style={{
        backgroundColor: checked ? 'var(--color-accent)' : 'var(--color-border)',
      }}
    >
      <span
        className="inline-block h-4 w-4 rounded-full shadow-sm transition-transform duration-200"
        style={{
          backgroundColor: 'var(--color-white)',
          transform: checked ? 'translateX(1.375rem)' : 'translateX(0.25rem)',
        }}
      />
    </button>
  );
}
