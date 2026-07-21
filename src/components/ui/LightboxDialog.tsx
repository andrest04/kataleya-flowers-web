'use client';

import { AnimatePresence, domAnimation, LazyMotion, m } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import Image from 'next/image';
import { Dialog as DialogPrimitive } from 'radix-ui';
import { useCallback, useEffect, useEffectEvent, useRef, useState } from 'react';

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
  // Key strategy: the key must NEVER change on close.
  //
  // Invariant: the key only changes when the user opens a DIFFERENT thumbnail
  // (a different initialIndex) while already open, or on a close→reopen cycle
  // at a new index. It must remain frozen when `open` flips true→false, so
  // that the same LightboxInner instance stays mounted through the exit
  // animation and Radix Dialog can finish its focus-restore cleanup before
  // unmounting.
  //
  // We track the last initialIndex seen while open in a state variable. When
  // `open` is true we update it via the render-phase setState pattern (React
  // docs: "adjusting state when props change"). When `open` is false we leave
  // it unchanged, so the key is frozen at the value it had when the dialog was
  // last open. On reopen, LightboxInner's own render-phase reset syncs its
  // internal index without remounting.
  const [frozenIndex, setFrozenIndex] = useState(props.initialIndex ?? 0);
  const incoming = props.initialIndex ?? 0;
  if (props.open && incoming !== frozenIndex) {
    setFrozenIndex(incoming);
  }

  return <LightboxInner key={frozenIndex} {...props} />;
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

  // Reset internal index when the dialog reopens (open: false → true).
  //
  // Because the outer LightboxDialog freezes the key on close, the same
  // LightboxInner instance persists through the exit animation. When the user
  // reopens (possibly on a different thumbnail or after internal navigation),
  // we sync the internal index to the new initialIndex without remounting.
  //
  // Technique: store `prevOpen` in state — NOT a ref (refs during render are
  // blocked by react-hooks/refs). When we detect a false→true transition we
  // also update the index in the same render. React treats multiple setState
  // calls in the render body as a single synchronous re-render and discards
  // the intermediate frame, which is the canonical "adjust state when a prop
  // changes" pattern (https://react.dev/learn/you-might-not-need-an-effect
  // #adjusting-some-state-when-a-prop-changes).
  const [prevOpen, setPrevOpen] = useState(open);
  if (prevOpen !== open) {
    setPrevOpen(open);
    if (!prevOpen && open) {
      const next = clampIndex(initialIndex, total);
      if (next !== index) setIndex(next);
    }
  }

  const goPrev = useCallback(() => {
    if (!hasMultiple) return;
    setIndex((i) => (i - 1 + total) % total);
  }, [hasMultiple, total]);

  const goNext = useCallback(() => {
    if (!hasMultiple) return;
    setIndex((i) => (i + 1) % total);
  }, [hasMultiple, total]);

  // Navegación con teclado ← / → mientras el modal está abierto.
  const onKeyNav = useEffectEvent((e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goPrev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      goNext();
    }
  });

  useEffect(() => {
    if (!open || !hasMultiple) return;
    document.addEventListener('keydown', onKeyNav);
    return () => document.removeEventListener('keydown', onKeyNav);
  }, [open, hasMultiple]);

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
