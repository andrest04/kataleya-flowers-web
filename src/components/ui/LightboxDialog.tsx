'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Dialog as DialogPrimitive } from 'radix-ui';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { LazyMotion, domAnimation, m, AnimatePresence } from 'framer-motion';

interface LightboxDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  images: string[];
  initialIndex?: number;
  alt: string;
}

const SWIPE_THRESHOLD = 50;

/**
 * Modal lightbox accesible para galerías de imágenes.
 *
 * Built on Radix Dialog so we get for free:
 *  - focus trap + restore focus al elemento que abrió el modal
 *  - aria-modal + aria-labelledby
 *  - cierre con ESC y click en backdrop
 *  - body scroll lock
 *  - portal en document.body
 *
 * Encima agregamos:
 *  - navegación con ←/→
 *  - swipe táctil
 *  - animación de entrada/salida con LazyMotion + m
 *  - contador "n / total" cuando hay múltiples imágenes
 *
 * z-index `z-[100]` cubre Navbar (z-[90]) y WhatsAppFloat (z-50).
 */
export default function LightboxDialog(props: LightboxDialogProps) {
  // Remontamos el inner cada vez que se abre o cambia initialIndex para que
  // el state del índice arranque limpio sin un effect que llame setState.
  return <LightboxInner key={`${props.open ? 'open' : 'closed'}-${props.initialIndex ?? 0}`} {...props} />;
}

function LightboxInner({
  open,
  onOpenChange,
  images,
  initialIndex = 0,
  alt,
}: LightboxDialogProps) {
  const safeImages = images.length > 0 ? images : [];
  const [index, setIndex] = useState(() => clampIndex(initialIndex, safeImages.length));
  const touchStartX = useRef<number | null>(null);

  const total = safeImages.length;
  const hasMultiple = total > 1;

  const goPrev = useCallback(() => {
    if (!hasMultiple) return;
    setIndex((i) => (i - 1 + total) % total);
  }, [hasMultiple, total]);

  const goNext = useCallback(() => {
    if (!hasMultiple) return;
    setIndex((i) => (i + 1) % total);
  }, [hasMultiple, total]);

  // Navegación con teclado ← / → mientras el modal está abierto.
  useEffect(() => {
    if (!open || !hasMultiple) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goPrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goNext();
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, hasMultiple, goPrev, goNext]);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const endX = e.changedTouches[0]?.clientX ?? touchStartX.current;
    const delta = endX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < SWIPE_THRESHOLD) return;
    if (delta > 0) goPrev();
    else goNext();
  }

  if (total === 0) return null;
  const currentSrc = safeImages[index];
  if (!currentSrc) return null;

  return (
    <LazyMotion features={domAnimation}>
      <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
        <AnimatePresence>
          {open && (
            <DialogPrimitive.Portal forceMount>
              <DialogPrimitive.Overlay asChild>
                <m.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="fixed inset-0 z-[100]"
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--color-dark) 85%, transparent)',
                  }}
                />
              </DialogPrimitive.Overlay>

              <DialogPrimitive.Content
                asChild
                aria-describedby={undefined}
              >
                <m.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                  className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 outline-none"
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                >
                  <DialogPrimitive.Title className="sr-only">{alt}</DialogPrimitive.Title>

                  {/* Imagen */}
                  <div className="relative w-full h-full max-w-5xl max-h-[85vh]">
                    <Image
                      src={currentSrc}
                      alt={hasMultiple ? `${alt} (${index + 1} de ${total})` : alt}
                      fill
                      sizes="(max-width: 1024px) 100vw, 80vw"
                      className="object-contain select-none"
                      priority
                    />
                  </div>

                  {/* Botón cerrar */}
                  <DialogPrimitive.Close asChild>
                    <button
                      type="button"
                      className="fixed top-4 right-4 md:top-6 md:right-6 flex items-center justify-center w-10 h-10 rounded-full transition-colors outline-none focus-visible:ring-2"
                      style={{
                        backgroundColor: 'color-mix(in srgb, var(--color-dark) 50%, transparent)',
                        color: 'var(--color-white)',
                      }}
                      aria-label="Cerrar"
                    >
                      <X className="w-5 h-5" aria-hidden="true" />
                    </button>
                  </DialogPrimitive.Close>

                  {/* Navegación entre imágenes */}
                  {hasMultiple && (
                    <>
                      <button
                        type="button"
                        onClick={goPrev}
                        className="fixed left-2 md:left-6 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full transition-colors outline-none focus-visible:ring-2"
                        style={{
                          backgroundColor: 'color-mix(in srgb, var(--color-dark) 50%, transparent)',
                          color: 'var(--color-white)',
                        }}
                        aria-label="Imagen anterior"
                      >
                        <ChevronLeft className="w-5 h-5" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={goNext}
                        className="fixed right-2 md:right-6 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full transition-colors outline-none focus-visible:ring-2"
                        style={{
                          backgroundColor: 'color-mix(in srgb, var(--color-dark) 50%, transparent)',
                          color: 'var(--color-white)',
                        }}
                        aria-label="Imagen siguiente"
                      >
                        <ChevronRight className="w-5 h-5" aria-hidden="true" />
                      </button>

                      {/* Contador */}
                      <div
                        className="fixed bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: 'color-mix(in srgb, var(--color-dark) 60%, transparent)',
                          color: 'var(--color-white)',
                        }}
                        aria-live="polite"
                      >
                        {index + 1} / {total}
                      </div>
                    </>
                  )}
                </m.div>
              </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
          )}
        </AnimatePresence>
      </DialogPrimitive.Root>
    </LazyMotion>
  );
}

function clampIndex(index: number, total: number): number {
  if (total === 0) return 0;
  if (index < 0) return 0;
  if (index >= total) return total - 1;
  return index;
}
