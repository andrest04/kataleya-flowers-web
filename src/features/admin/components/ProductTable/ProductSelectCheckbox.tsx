'use client';

import { useEffect, useRef } from 'react';

interface ProductSelectCheckboxProps {
  checked: boolean;
  indeterminate?: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}

export default function ProductSelectCheckbox({
  checked,
  indeterminate = false,
  label,
  onChange,
}: ProductSelectCheckboxProps) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate && !checked;
  }, [indeterminate, checked]);

  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      aria-label={label}
      onChange={(event) => onChange(event.target.checked)}
      className="size-4 cursor-pointer accent-(--color-primary) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-primary)"
    />
  );
}
