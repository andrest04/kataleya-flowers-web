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

export default function LightboxDialog(props: LightboxDialogProps) {
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
