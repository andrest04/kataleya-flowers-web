import { FieldError } from '@/components/ui/FieldError';

interface RecoveryFieldProps {
  id: string;
  label: string;
  type: 'email' | 'password';
  autoComplete: 'email' | 'new-password';
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  describedBy?: string;
}

export default function RecoveryField({
  id,
  label,
  type,
  autoComplete,
  value,
  onChange,
  error,
  hint,
  describedBy,
}: RecoveryFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const descriptionIds = [hintId, describedBy, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium mb-1.5"
        style={{ color: 'var(--color-dark)' }}
      >
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required
        aria-required="true"
        aria-invalid={error ? true : undefined}
        aria-describedby={descriptionIds}
        autoComplete={autoComplete}
        className="w-full px-3 py-2.5 rounded-lg text-base md:text-sm outline-none transition-shadow focus:ring-2"
        style={{
          border: '1px solid var(--color-border)',
          background: 'var(--color-cream)',
          color: 'var(--color-dark)',
        }}
      />
      {hint && (
        <p id={hintId} className="mt-1 text-xs" style={{ color: 'var(--color-muted)' }}>
          {hint}
        </p>
      )}
      <FieldError id={errorId} message={error} />
    </div>
  );
}
