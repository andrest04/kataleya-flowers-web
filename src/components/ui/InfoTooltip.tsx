'use client';

import { Info } from 'lucide-react';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/primitives/tooltip';

interface InfoTooltipProps {
  label: string;
}

export default function InfoTooltip({ label }: InfoTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={label}
            className="relative inline-flex size-4 shrink-0 items-center justify-center text-(--color-muted) transition-opacity after:absolute after:-inset-3.5 hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-primary)"
          >
            <Info className="size-4" aria-hidden="true" strokeWidth={1.8} />
          </button>
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
