'use client';

import { Pencil } from 'lucide-react';
import { type ReactNode, useEffect, useRef, useState } from 'react';

import { HERO_MIN_HEIGHT_PX } from '@/features/landing/components/HeroSection/frame';

interface HeroLiveFrameProps {
  children: ReactNode;
  onEditPhoto: () => void;
}

export default function HeroLiveFrame({ children, onEditPhoto }: HeroLiveFrameProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [viewportWidth, setViewportWidth] = useState(1280);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    function sync() {
      const width = frame?.clientWidth ?? 800;
      const nextViewport = window.innerWidth;
      setViewportWidth(nextViewport);
      setScale(width / nextViewport);
    }

    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(frame);
    window.addEventListener('resize', sync);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', sync);
    };
  }, []);

  return (
    <div ref={frameRef} className="relative overflow-hidden" style={{ height: HERO_MIN_HEIGHT_PX * scale }}>
      <div
        className="origin-top-left"
        style={{
          height: HERO_MIN_HEIGHT_PX,
          transform: `scale(${scale})`,
          width: viewportWidth,
        }}
      >
        {children}
      </div>
      <button
        type="button"
        aria-label="Editar foto"
        className="absolute top-4 right-4 flex size-11 cursor-pointer items-center justify-center rounded-full bg-(--color-cream) text-(--color-dark) shadow-sm transition-[transform,background-color,box-shadow] duration-200 ease-out hover:bg-(--color-white) hover:shadow-md active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-cream) motion-reduce:transition-none motion-reduce:active:scale-100"
        onClick={onEditPhoto}
      >
        <Pencil className="size-4" aria-hidden="true" strokeWidth={1.8} />
      </button>
    </div>
  );
}
