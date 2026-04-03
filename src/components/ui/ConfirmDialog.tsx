'use client';

import { useEffect, useRef, useCallback } from 'react';
import Button from '@/components/ui/Button';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  confirmDisabled?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children?: React.ReactNode;
}

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Eliminar',
  cancelLabel = 'Cancelar',
  loading = false,
  confirmDisabled = false,
  onConfirm,
  onCancel,
  children,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) onCancel();
    },
    [onCancel, loading],
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener('keydown', handleKeyDown);
    dialogRef.current?.focus();
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-desc"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 transition-opacity"
        style={{ background: 'color-mix(in srgb, var(--color-dark) 40%, transparent)' }}
        onClick={loading ? undefined : onCancel}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="relative w-full max-w-md rounded-2xl p-6 shadow-xl outline-none"
        style={{
          background: 'var(--color-white)',
          border: '1px solid var(--color-border)',
        }}
      >
        {/* Icon */}
        <div
          className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full"
          style={{
            background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
          }}
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="var(--color-primary)"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
            />
          </svg>
        </div>

        <h3
          id="confirm-dialog-title"
          className="text-center text-lg font-semibold"
          style={{ color: 'var(--color-dark)', fontFamily: 'var(--font-heading)' }}
        >
          {title}
        </h3>

        <p
          id="confirm-dialog-desc"
          className="mt-2 text-center text-sm"
          style={{ color: 'var(--color-muted)' }}
        >
          {description}
        </p>

        {children && <div className="mt-4">{children}</div>}

        <div className="mt-6 flex items-center justify-center gap-3">
          <Button
            variant="ghost"
            size="md"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant="destructive"
            size="md"
            onClick={onConfirm}
            loading={loading}
            disabled={confirmDisabled}
          >
            {loading ? 'Eliminando…' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
