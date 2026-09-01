'use client';

import { type ReactNode, useEffect, useRef, useState } from 'react';

import CoverButton from '@/features/admin/components/CoverEditor/CoverButton';
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
      <CoverButton onClick={onEditPhoto} />
    </div>
  );
}
