'use client';

import { Loader2 } from 'lucide-react';
import Link from 'next/link';

import { Button as ShadcnButton } from '@/components/ui/primitives/button';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'whatsapp';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonBaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
  children: React.ReactNode;
}

type ButtonAsButton = ButtonBaseProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonBaseProps> & {
    href?: undefined;
    external?: undefined;
  };

type ButtonAsLink = ButtonBaseProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof ButtonBaseProps> & {
    href: string;
    external?: boolean;
  };

type ButtonProps = ButtonAsButton | ButtonAsLink;

type ShadcnVariant = React.ComponentProps<typeof ShadcnButton>['variant'];

const variantMap: Record<ButtonVariant, ShadcnVariant> = {
  primary: 'default',
  secondary: 'outline',
  ghost: 'ghost',
  destructive: 'destructive',
  whatsapp: 'default',
};

const focusRing =
  'focus-visible:ring-2 focus-visible:ring-(color:--color-primary) focus-visible:ring-offset-2 focus-visible:ring-offset-(color:--color-cream)';

const orderClasses =
  'rounded-sm font-bold uppercase tracking-[0.08em] bg-(--color-primary) text-(--color-white) shadow-md transition-colors duration-500 hover:!bg-[color-mix(in_srgb,var(--color-primary)_80%,var(--color-dark))] hover:!text-(--color-white)';

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    orderClasses,
  secondary: 'rounded-full font-semibold border-primary text-primary bg-transparent hover:opacity-80',
  ghost: 'rounded-lg font-medium',
  destructive: 'rounded-lg font-medium',
  whatsapp:
    orderClasses,
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-10 px-3 text-xs',
  md: 'h-12 px-5 text-sm',
  lg: 'h-14 px-7 text-sm tracking-[0.08em] uppercase',
};

export default function Button(props: ButtonProps) {
  const {
    variant = 'primary',
    size = 'md',
    loading = false,
    fullWidth = false,
    className,
    children,
    ...rest
  } = props;

  const shadcnVariant: NonNullable<ShadcnVariant> = variantMap[variant] as NonNullable<ShadcnVariant>;
  const combinedClassName = cn(
    variantClasses[variant],
    focusRing,
    sizeClasses[size],
    fullWidth && 'w-full',
    'gap-2',
    className,
  );

  if ('href' in rest && rest.href) {
    const { href, external, style, ...anchorProps } = rest as ButtonAsLink;

    if (external) {
      return (
        <ShadcnButton variant={shadcnVariant} asChild className={combinedClassName}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            style={style}
            {...anchorProps}
          >
            {children}
          </a>
        </ShadcnButton>
      );
    }

    return (
      <ShadcnButton variant={shadcnVariant} asChild className={combinedClassName}>
        <Link href={href} style={style} {...anchorProps}>
          {children}
        </Link>
      </ShadcnButton>
    );
  }

  const { style, ...buttonProps } = rest as Omit<ButtonAsButton, 'href' | 'external' | 'variant' | 'size'>;

  return (
    <ShadcnButton
      variant={shadcnVariant}
      type={buttonProps.type ?? 'button'}
      disabled={loading || buttonProps.disabled}
      aria-busy={loading}
      className={combinedClassName}
      style={style}
      {...buttonProps}
    >
      {loading ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
      {children}
    </ShadcnButton>
  );
}
