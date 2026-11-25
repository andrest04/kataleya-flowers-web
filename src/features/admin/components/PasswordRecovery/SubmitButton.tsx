interface SubmitButtonProps {
  pending: boolean;
  label: string;
  pendingLabel: string;
  disabled?: boolean;
  describedBy?: string;
}

export default function SubmitButton({
  pending,
  label,
  pendingLabel,
  disabled = false,
  describedBy,
}: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      aria-busy={pending}
      aria-describedby={describedBy}
      className="w-full py-3 rounded-lg text-sm font-medium transition-opacity disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
      style={{ background: 'var(--color-primary)', color: 'var(--color-white)' }}
    >
      {pending ? pendingLabel : label}
    </button>
  );
}
