'use client';

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

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'rounded-full font-semibold hover:opacity-90',
  secondary: 'rounded-full font-semibold border-primary text-primary bg-transparent hover:opacity-80',
  ghost: 'rounded-lg font-medium',
  destructive: 'rounded-lg font-medium',
  whatsapp: 'rounded-full font-semibold bg-whatsapp text-primary-foreground hover:opacity-90',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-auto px-3 py-1.5 text-xs',
  md: 'h-auto px-5 py-2.5 text-sm',
  lg: 'h-auto px-7 py-3 text-sm tracking-[0.08em] uppercase',
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
      className={combinedClassName}
      style={style}
      {...buttonProps}
    >
      {children}
    </ShadcnButton>
  );
}
