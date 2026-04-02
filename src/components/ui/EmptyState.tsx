interface EmptyStateProps {
  message: string;
  action?: React.ReactNode;
}

export default function EmptyState({ message, action }: EmptyStateProps) {
  return (
    <div
      className="rounded-xl p-12 text-center"
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
    >
      <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
        {message}
      </p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
