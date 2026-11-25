import { Check, Circle } from 'lucide-react';

interface PasswordCriterionItemProps {
  label: string;
  met: boolean;
}

export default function PasswordCriterionItem({ label, met }: PasswordCriterionItemProps) {
  const Icon = met ? Check : Circle;

  return (
    <li
      className="flex items-center gap-2 text-xs"
      style={{ color: met ? 'var(--color-dark)' : 'var(--color-muted)' }}
    >
      <Icon
        aria-hidden="true"
        className="size-3.5 shrink-0"
        strokeWidth={met ? 3 : 2}
        style={{ color: met ? 'var(--color-accent)' : 'var(--color-muted)' }}
      />
      <span>
        <span className="sr-only">{met ? 'Cumplido: ' : 'Pendiente: '}</span>
        {label}
      </span>
    </li>
  );
}
