'use client';

import InfoTooltip from '@/components/ui/InfoTooltip';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/primitives/tooltip';
import ToggleSwitch from '@/components/ui/ToggleSwitch';

interface VisibilityLimitControlProps {
  allowActivate: boolean;
  allowHide: boolean;
  checked: boolean;
  hideLabel: string;
  limitCopy: string;
  showLabel: string;
  onChange: (checked: boolean) => void;
}

export default function VisibilityLimitControl({
  allowActivate,
  allowHide,
  checked,
  hideLabel,
  limitCopy,
  showLabel,
  onChange,
}: VisibilityLimitControlProps) {
  const limited = !allowActivate && !checked;
  const label = checked ? hideLabel : showLabel;
  const toggle = (
    <ToggleSwitch
      checked={checked}
      disabled={(!allowHide && checked) || limited}
      label={limited ? `${label}. ${limitCopy}` : label}
      onChange={(next) => {
        if (!next && !allowHide) return;
        if (next && !allowActivate) return;
        onChange(next);
      }}
    />
  );

  return (
    <TooltipProvider>
      <div className="flex items-center gap-3">
        {limited ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex">{toggle}</span>
            </TooltipTrigger>
            <TooltipContent>{limitCopy}</TooltipContent>
          </Tooltip>
        ) : (
          toggle
        )}
        <span className="text-sm text-(--color-dark)">
          {checked ? 'Visible' : 'Oculto'}
        </span>
        <InfoTooltip label={limitCopy} />
      </div>
    </TooltipProvider>
  );
}
