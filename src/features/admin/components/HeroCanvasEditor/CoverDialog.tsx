'use client';

import { Camera, Pencil, X } from 'lucide-react';
import { Dialog as DialogPrimitive } from 'radix-ui';
import { type ChangeEvent, useRef, useState } from 'react';

import Image from '@/components/ui/AppwriteImage';
import { HERO_IMAGE_WIDTH_PX, HERO_MIN_HEIGHT_PX } from '@/features/landing/components/HeroSection/frame';

import { liveHeroCropAspect, sourceUrlForCrop } from './crop';
import CropStage from './CropStage';

interface CoverDialogProps {
  busy: boolean;
  imageAlt: string;
  imageUrl: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPickFile: (file: File) => void;
}

export default function CoverDialog({
  busy,
  imageAlt,
  imageUrl,
  open,
  onOpenChange,
  onPickFile,
}: CoverDialogProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<'cover' | 'crop'>('cover');
  const [cropSrc, setCropSrc] = useState(imageUrl);

  function handleOpenChange(next: boolean) {
    if (!next) setMode('cover');
    onOpenChange(next);
  }

  function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const blobUrl = URL.createObjectURL(file);
    setCropSrc(blobUrl);
    setMode('crop');
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className="fixed inset-0 z-[100]"
          style={{ backgroundColor: 'color-mix(in srgb, var(--color-dark) 55%, transparent)' }}
        />
        <DialogPrimitive.Content className="fixed top-1/2 left-1/2 z-[100] w-[min(56rem,calc(100%-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl bg-(--color-white) outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-primary)">
          <div className="flex items-center justify-between border-b border-(--color-border) px-4 py-3">
            <DialogPrimitive.Title className="font-medium text-(--color-dark)">
              {mode === 'crop' ? 'Editar foto' : 'Foto'}
            </DialogPrimitive.Title>
            <DialogPrimitive.Close
              className="flex size-11 items-center justify-center rounded-lg text-(--color-muted) transition-[transform,background-color,color] duration-200 ease-out hover:bg-(--color-surface) hover:text-(--color-dark) active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-primary) motion-reduce:transition-none motion-reduce:active:scale-100"
              aria-label="Cerrar"
            >
              <X className="size-4" aria-hidden="true" strokeWidth={1.8} />
            </DialogPrimitive.Close>
          </div>

          {mode === 'crop' ? (
            <div className="p-4">
              <CropStage
                busy={busy}
                src={cropSrc.startsWith('blob:') ? cropSrc : sourceUrlForCrop(cropSrc)}
                onCancel={() => setMode('cover')}
                onSave={onPickFile}
              />
            </div>
          ) : (
            <>
              <div className="relative bg-(--color-surface)" style={{ aspectRatio: String(liveHeroCropAspect()) }}>
                {imageUrl ? (
                  <Image src={imageUrl} alt={imageAlt} fill className="object-cover" sizes="56rem" />
                ) : null}
              </div>
              <p className="border-t border-(--color-border) px-4 py-2 text-center text-xs text-(--color-muted)">
                {HERO_IMAGE_WIDTH_PX} × {HERO_MIN_HEIGHT_PX} px o más
              </p>
              <div className="grid grid-cols-2 divide-x divide-(--color-border) border-t border-(--color-border)">
                <button
                  type="button"
                  className="flex min-h-14 items-center justify-center gap-2 text-sm text-(--color-dark) transition-[transform,background-color,color] duration-200 ease-out hover:bg-(--color-surface) hover:text-(--color-primary) active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-primary) motion-reduce:transition-none motion-reduce:active:scale-100"
                  onClick={() => {
                    setCropSrc(imageUrl);
                    setMode('crop');
                  }}
                >
                  <Pencil className="size-4" aria-hidden="true" strokeWidth={1.8} />
                  Editar
                </button>
                <button
                  type="button"
                  className="flex min-h-14 items-center justify-center gap-2 text-sm text-(--color-dark) transition-[transform,background-color,color] duration-200 ease-out hover:bg-(--color-surface) hover:text-(--color-primary) active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-primary) motion-reduce:transition-none motion-reduce:active:scale-100"
                  onClick={() => fileRef.current?.click()}
                >
                  <Camera className="size-4" aria-hidden="true" strokeWidth={1.8} />
                  Cambiar foto
                </button>
              </div>
            </>
          )}

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleFile}
          />
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
