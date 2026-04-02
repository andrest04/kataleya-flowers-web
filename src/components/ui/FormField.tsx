interface FormFieldProps {
  label: string;
  required?: boolean;
  htmlFor?: string;
  children: React.ReactNode;
}

export function FormField({ label, required, htmlFor, children }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium"
        style={{ color: 'var(--color-dark)' }}
      >
        {label}
        {required && <span style={{ color: 'var(--color-primary)' }}> *</span>}
      </label>
      {children}
    </div>
  );
}

interface FormErrorProps {
  message?: string | null;
}

export function FormError({ message }: FormErrorProps) {
  if (!message) return null;

  return (
    <div
      className="rounded-lg px-4 py-3 text-sm"
      style={{
        background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
        color: 'var(--color-primary)',
        border: '1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)',
      }}
    >
      {message}
    </div>
  );
}
