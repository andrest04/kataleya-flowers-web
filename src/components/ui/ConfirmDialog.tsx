'use client';

import { AlertTriangle } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@/components/ui/primitives/alert-dialog';

type ConfirmVariant = 'destructive' | 'default';

interface ConfirmDialogProps {
  open: boolean;
  /**
   * Radix-style controlled handler. Recibe `false` cuando el usuario cierra
   * con ESC, click backdrop o el botón cancel.
   */
  onOpenChange?: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Loading state — deshabilita ambos botones y muestra "Eliminando…". */
  loading?: boolean;
  /** Sin loading: solo deshabilita el confirm (ej. validación pendiente). */
  confirmDisabled?: boolean;
  /** `destructive` agrega ícono de advertencia + botón rojo; `default` mantiene neutro. */
  variant?: ConfirmVariant;
  onConfirm: () => void;
  /** @deprecated usar `onOpenChange(false)` o sólo Radix close (Esc/backdrop). Mantengo para retrocompatibilidad. */
  onCancel?: () => void;
  children?: React.ReactNode;
}

/**
 * Confirmación modal accesible (Radix AlertDialog) — focus inicial en cancel,
 * cierre con ESC y click backdrop, focus trap y restore focus integrados.
 */
export default function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Eliminar',
  cancelLabel = 'Cancelar',
  loading = false,
  confirmDisabled = false,
  variant = 'destructive',
  onConfirm,
  onCancel,
  children,
}: ConfirmDialogProps) {
  function handleOpenChange(next: boolean) {
    if (!next) onCancel?.();
    onOpenChange?.(next);
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          {variant === 'destructive' && (
            <AlertDialogMedia
              style={{
                background: 'color-mix(in srgb, var(--color-primary) 12%, transparent)',
                color: 'var(--color-primary)',
              }}
            >
              <AlertTriangle aria-hidden="true" />
            </AlertDialogMedia>
          )}
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        {children && <div>{children}</div>}
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onCancel?.()} disabled={loading}>
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            variant={variant === 'destructive' ? 'destructive' : 'default'}
            onClick={onConfirm}
            disabled={loading || confirmDisabled}
          >
            {loading ? 'Eliminando…' : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
