'use client';

import Image from 'next/image';

interface SearchResultItemProps {
  imageUrl: string;
  name: string;
  subtitle: string;
  price: string;
  onClick: () => void;
}

export default function SearchResultItem({
  imageUrl,
  name,
  subtitle,
  price,
  onClick,
}: SearchResultItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors duration-150"
      style={{ borderBottom: '1px solid var(--color-border)' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--color-surface)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg">
        <Image
          src={imageUrl}
          alt={name}
          fill
          sizes="40px"
          className="object-cover"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p
          className="truncate text-sm font-medium"
          style={{ color: 'var(--color-dark)', fontFamily: 'var(--font-body)' }}
        >
          {name}
        </p>
        <p
          className="truncate text-xs"
          style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-body)' }}
        >
          {subtitle}
        </p>
      </div>
      <span
        className="shrink-0 text-sm font-medium"
        style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-body)' }}
      >
        {price}
      </span>
    </button>
  );
}
