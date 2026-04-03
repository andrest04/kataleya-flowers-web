'use client';

import Link from 'next/link';

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

const variantStyles: Record<ButtonVariant, { base: string; style: React.CSSProperties }> = {
  primary: {
    base: 'rounded-full font-semibold transition-opacity hover:opacity-90 disabled:opacity-50',
    style: {
      backgroundColor: 'var(--color-primary)',
      color: 'var(--color-cream)',
    },
  },
  secondary: {
    base: 'rounded-full font-semibold border transition-opacity hover:opacity-80 disabled:opacity-50',
    style: {
      borderColor: 'var(--color-primary)',
      color: 'var(--color-primary)',
    },
  },
  ghost: {
    base: 'rounded-lg font-medium transition-opacity hover:opacity-70 disabled:opacity-40',
    style: {
      background: 'var(--color-surface)',
      color: 'var(--color-dark)',
      border: '1px solid var(--color-border)',
    },
  },
  destructive: {
    base: 'rounded-lg font-medium transition-opacity hover:opacity-70 disabled:opacity-40',
    style: {
      background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
      color: 'var(--color-primary)',
      border: '1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)',
    },
  },
  whatsapp: {
    base: 'rounded-full font-semibold transition-opacity hover:opacity-90 disabled:opacity-50',
    style: {
      backgroundColor: 'var(--color-whatsapp)',
      color: 'var(--color-cream)',
    },
  },
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3 text-sm tracking-[0.08em] uppercase',
};

export default function Button(props: ButtonProps) {
  const {
    variant = 'primary',
    size = 'md',
    loading = false,
    fullWidth = false,
    className = '',
    children,
    ...rest
  } = props;

  const v = variantStyles[variant];
  const s = sizeStyles[size];
  const widthClass = fullWidth ? 'w-full' : '';
  const classes = `${v.base} ${s} ${widthClass} ${className}`.trim();

  if ('href' in rest && rest.href) {
    const { href, external, ...anchorProps } = rest as ButtonAsLink;

    const { style: callerStyle, ...restAnchorProps } = anchorProps;
    const mergedStyle = { ...v.style, ...callerStyle };

    if (external) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center justify-center gap-2 ${classes}`}
          style={mergedStyle}
          {...restAnchorProps}
        >
          {children}
        </a>
      );
    }

    return (
      <Link
        href={href}
        className={`inline-flex items-center justify-center gap-2 ${classes}`}
        style={mergedStyle}
        {...restAnchorProps}
      >
        {children}
      </Link>
    );
  }

  const { style: callerBtnStyle, ...restButtonProps } = rest as Omit<ButtonAsButton, 'href' | 'external'>;
  const mergedBtnStyle = { ...v.style, ...callerBtnStyle };

  return (
    <button
      type={restButtonProps.type ?? 'button'}
      disabled={loading || restButtonProps.disabled}
      className={`inline-flex items-center justify-center gap-2 ${classes}`}
      style={mergedBtnStyle}
      {...restButtonProps}
    >
      {children}
    </button>
  );
}
