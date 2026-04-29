import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface Props {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export default function ChartCard({ title, description, children, className }: Props) {
  return (
    <div
      className={cn('rounded-xl p-6', className)}
      style={{
        backgroundColor: 'var(--color-white)',
        border: '1px solid var(--color-border)',
      }}
    >
      <p
        className="text-base font-semibold font-serif"
        style={{ color: 'var(--color-dark)' }}
      >
        {title}
      </p>
      {description && (
        <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
          {description}
        </p>
      )}
      <div className="mt-4">{children}</div>
    </div>
  );
}
