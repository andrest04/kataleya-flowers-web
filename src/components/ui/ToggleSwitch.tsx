'use client';

import { Switch } from '@/components/ui/primitives/switch';

interface ToggleSwitchProps {
  checked: boolean;
  disabled?: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}

export default function ToggleSwitch({
  checked,
  disabled = false,
  label,
  onChange,
}: ToggleSwitchProps) {
  return (
    <Switch
      checked={checked}
      onCheckedChange={onChange}
      disabled={disabled}
      aria-label={label}
    />
  );
}
