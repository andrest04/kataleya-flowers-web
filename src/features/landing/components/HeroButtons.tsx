'use client';

import Button from '@/components/ui/Button';

interface HeroButtonsProps {
  external?: boolean;
  href: string;
  label: string;
}

export default function HeroButtons({
  external = false,
  href,
  label,
}: HeroButtonsProps) {
  return (
    <Button
      variant="ghost"
      href={href}
      external={external}
      className="rounded-none border-2 border-(--color-dark) bg-(--color-cream) px-8 py-3.5 text-xs font-bold tracking-[0.15em] text-(--color-dark) uppercase transition-colors duration-300 hover:bg-(--color-dark) hover:text-(--color-cream)"
    >
      {label}
    </Button>
  );
}
