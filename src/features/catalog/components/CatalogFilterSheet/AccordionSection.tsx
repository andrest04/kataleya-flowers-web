'use client';

import { Minus, Plus } from 'lucide-react';
import type { ReactNode } from 'react';
import { forwardRef } from 'react';

const AccordionSection = forwardRef<
  HTMLDetailsElement,
  {
    title: string;
    subtitle?: string;
    defaultOpen?: boolean;
    children: ReactNode;
  }
>(function AccordionSection({ title, subtitle, defaultOpen, children }, ref) {
  return (
    <details
      ref={ref}
      className="group border-b border-(--color-border) py-4 last:border-0"
      open={defaultOpen}
    >
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 font-body text-base font-semibold text-(--color-dark) [&::-webkit-details-marker]:hidden">
        <span>
          {title}
          {subtitle && (
            <span className="ml-1 font-normal text-(--color-muted)">{subtitle}</span>
          )}
        </span>
        <Plus className="size-4 shrink-0 group-open:hidden" aria-hidden="true" />
        <Minus className="hidden size-4 shrink-0 group-open:block" aria-hidden="true" />
      </summary>
      <div className="mt-4">{children}</div>
    </details>
  );
});

export default AccordionSection;
