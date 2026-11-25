import { clampPan } from './crop';

export interface PanOffset {
  x: number;
  y: number;
}

export interface NudgeBounds {
  drawnHeight: number;
  drawnWidth: number;
  viewHeight: number;
  viewWidth: number;
}

const DIRECTIONS: Record<string, PanOffset> = {
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  ArrowUp: { x: 0, y: -1 },
};

export function nudgeOffset(
  offset: PanOffset,
  key: string,
  shift: boolean,
  bounds: NudgeBounds,
): PanOffset | null {
  const direction = DIRECTIONS[key];
  if (!direction) return null;
  const ratio = (shift ? 10 : 1) / 100;
  return {
    x: clampPan(offset.x + direction.x * bounds.viewWidth * ratio, bounds.viewWidth, bounds.drawnWidth),
    y: clampPan(offset.y + direction.y * bounds.viewHeight * ratio, bounds.viewHeight, bounds.drawnHeight),
  };
}

export function panPercent(pan: number, view: number, drawn: number): number {
  const max = Math.max(0, drawn - view) / 2;
  if (max === 0) return 0;
  return Math.round((pan / max) * 100);
}
