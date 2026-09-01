'use client';

import { Pencil } from 'lucide-react';

interface CoverButtonProps {
  onClick: () => void;
}

export default function CoverButton({ onClick }: CoverButtonProps) {
  return (
    <button
      type="button"
      aria-label="Editar foto"
      className="absolute top-4 right-4 flex size-11 cursor-pointer items-center justify-center rounded-full bg-(--color-cream) text-(--color-dark) shadow-sm transition-[transform,background-color,box-shadow] duration-200 ease-out hover:bg-(--color-white) hover:shadow-md active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-cream) motion-reduce:transition-none motion-reduce:active:scale-100"
      onClick={onClick}
    >
      <Pencil className="size-4" aria-hidden="true" strokeWidth={1.8} />
    </button>
  );
}
