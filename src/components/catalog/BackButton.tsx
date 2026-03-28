'use client';

import { useRouter } from 'next/navigation';

interface BackButtonProps {
  label: string;
}

export function BackButton({ label }: BackButtonProps) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-body text-dark/70 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 shadow-sm"
      style={{
        backgroundColor: 'var(--color-white)',
        border: '1px solid color-mix(in srgb, var(--color-dark) 10%, transparent)',
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      {label}
    </button>
  );
}
