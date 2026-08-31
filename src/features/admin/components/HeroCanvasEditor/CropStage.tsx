'use client';

import { RotateCcw, RotateCw } from 'lucide-react';
import { type PointerEvent, useEffect, useRef, useState } from 'react';

import {
  clampPan,
  coverScale,
  liveHeroCropAspect,
  renderHeroCrop,
  rotatedSize,
} from './crop';

interface CropStageProps {
  busy: boolean;
  src: string;
  onCancel: () => void;
  onSave: (file: File) => void;
}

export default function CropStage({ busy, src, onCancel, onSave }: CropStageProps) {
  const viewRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [viewWidth, setViewWidth] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [aspect, setAspect] = useState(liveHeroCropAspect);

  useEffect(() => {
    const next = new window.Image();
    next.decoding = 'async';
    next.src = src;
    void next.decode().then(() => setImage(next)).catch(() => setImage(null));
  }, [src]);

  useEffect(() => {
    const element = viewRef.current;
    if (!element) return;
    function sync() {
      setAspect(liveHeroCropAspect());
      setViewWidth(element?.clientWidth ?? 0);
    }
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(element);
    window.addEventListener('resize', sync);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', sync);
    };
  }, []);

  const viewHeight = viewWidth / aspect;
  const size = image
    ? rotatedSize(image.naturalWidth, image.naturalHeight, rotation)
    : { height: 1, width: 1 };
  const drawnScale = image && viewWidth > 0
    ? coverScale(image.naturalWidth, image.naturalHeight, viewWidth, viewHeight, rotation) * zoom
    : 1;
  const clampedX = clampPan(panX, viewWidth, size.width * drawnScale);
  const clampedY = clampPan(panY, viewHeight, size.height * drawnScale);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image || viewWidth === 0) return;
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.round(viewWidth * ratio);
    canvas.height = Math.round(viewHeight * ratio);
    const context = canvas.getContext('2d');
    if (!context) return;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, viewWidth, viewHeight);
    context.translate(viewWidth / 2 + clampedX, viewHeight / 2 + clampedY);
    context.rotate((rotation * Math.PI) / 180);
    context.scale(drawnScale, drawnScale);
    context.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2);
  }, [clampedX, clampedY, drawnScale, image, rotation, viewHeight, viewWidth]);

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { x: event.clientX, y: event.clientY, panX: clampedX, panY: clampedY };
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag) return;
    setPanX(clampPan(drag.panX + event.clientX - drag.x, viewWidth, size.width * drawnScale));
    setPanY(clampPan(drag.panY + event.clientY - drag.y, viewHeight, size.height * drawnScale));
  }

  function handlePointerUp() {
    dragRef.current = null;
  }

  async function handleSave() {
    if (!image || viewWidth === 0) return;
    const blob = await renderHeroCrop({
      image,
      panX: clampedX,
      panY: clampedY,
      rotation,
      viewHeight,
      viewWidth,
      zoom,
    });
    onSave(new File([blob], 'hero.jpg', { type: 'image/jpeg' }));
  }

  return (
    <div className="space-y-4">
      <div
        ref={viewRef}
        className="relative cursor-grab overflow-hidden bg-(--color-surface) active:cursor-grabbing"
        style={{ aspectRatio: String(aspect) }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <canvas ref={canvasRef} className="h-full w-full touch-none" />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <label className="flex min-w-48 flex-1 items-center gap-3 text-sm text-(--color-dark)">
          <span className="sr-only">Zoom</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(event) => setZoom(Number(event.target.value))}
            className="w-full accent-(--color-primary)"
          />
        </label>
        <div className="flex gap-1">
          <button
            type="button"
            aria-label="Rotar a la izquierda"
            className="flex size-11 items-center justify-center rounded-lg text-(--color-dark) transition-[transform,background-color] duration-200 ease-out hover:bg-(--color-surface) active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-primary) motion-reduce:transition-none motion-reduce:active:scale-100"
            onClick={() => setRotation((value) => (value + 270) % 360)}
          >
            <RotateCcw className="size-4" aria-hidden="true" strokeWidth={1.8} />
          </button>
          <button
            type="button"
            aria-label="Rotar a la derecha"
            className="flex size-11 items-center justify-center rounded-lg text-(--color-dark) transition-[transform,background-color] duration-200 ease-out hover:bg-(--color-surface) active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-primary) motion-reduce:transition-none motion-reduce:active:scale-100"
            onClick={() => setRotation((value) => (value + 90) % 360)}
          >
            <RotateCw className="size-4" aria-hidden="true" strokeWidth={1.8} />
          </button>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          className="min-h-11 px-4 text-sm text-(--color-muted) transition-colors duration-200 ease-out hover:text-(--color-dark) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-primary) motion-reduce:transition-none"
          onClick={onCancel}
        >
          Cancelar
        </button>
        <button
          type="button"
          disabled={busy || !image}
          className="min-h-11 rounded-lg bg-(--color-primary) px-4 text-sm font-semibold text-(--color-cream) transition-[transform,opacity] duration-200 ease-out hover:opacity-90 active:scale-[0.96] disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-primary) motion-reduce:transition-none motion-reduce:active:scale-100"
          onClick={() => void handleSave()}
        >
          {busy ? 'Guardando…' : 'Guardar'}
        </button>
      </div>
    </div>
  );
}
