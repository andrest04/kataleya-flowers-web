import { Label } from '@/components/ui/primitives/label';

interface FormFieldProps {
  action?: React.ReactNode;
  children: React.ReactNode;
  htmlFor?: string;
  label: string;
  required?: boolean;
}

export function FormField({ action, children, htmlFor, label, required }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <Label htmlFor={htmlFor}>
          {label}
          {required && <span className="text-primary"> *</span>}
        </Label>
        {action}
      </div>
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
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
    >
      {message}
    </div>
  );
}
