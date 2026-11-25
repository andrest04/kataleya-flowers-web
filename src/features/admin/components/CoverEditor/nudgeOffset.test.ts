import { describe, expect, it } from 'vitest';

import { nudgeOffset, panPercent } from './nudgeOffset';

const bounds = { drawnHeight: 140, drawnWidth: 200, viewHeight: 100, viewWidth: 100 };
const origin = { x: 0, y: 0 };

describe('nudgeOffset', () => {
  it.each([
    ['ArrowLeft', { x: -1, y: 0 }],
    ['ArrowRight', { x: 1, y: 0 }],
    ['ArrowUp', { x: 0, y: -1 }],
    ['ArrowDown', { x: 0, y: 1 }],
  ])('moves the offset by 1%% of the view for %s', (key, expected) => {
    expect(nudgeOffset(origin, key, false, bounds)).toEqual(expected);
  });

  it.each([
    ['ArrowLeft', { x: -10, y: 0 }],
    ['ArrowRight', { x: 10, y: 0 }],
    ['ArrowUp', { x: 0, y: -10 }],
    ['ArrowDown', { x: 0, y: 10 }],
  ])('moves the offset by 10%% of the view for Shift+%s', (key, expected) => {
    expect(nudgeOffset(origin, key, true, bounds)).toEqual(expected);
  });

  it('scales the step with the view size', () => {
    const wide = { drawnHeight: 600, drawnWidth: 1000, viewHeight: 200, viewWidth: 400 };
    expect(nudgeOffset(origin, 'ArrowRight', false, wide)).toEqual({ x: 4, y: 0 });
    expect(nudgeOffset(origin, 'ArrowDown', true, wide)).toEqual({ x: 0, y: 20 });
  });

  it('clamps the result at the pan bounds', () => {
    expect(nudgeOffset({ x: 45, y: 0 }, 'ArrowRight', true, bounds)).toEqual({ x: 50, y: 0 });
    expect(nudgeOffset({ x: -45, y: 0 }, 'ArrowLeft', true, bounds)).toEqual({ x: -50, y: 0 });
    expect(nudgeOffset({ x: 0, y: 15 }, 'ArrowDown', true, bounds)).toEqual({ x: 0, y: 20 });
    expect(nudgeOffset({ x: 0, y: -15 }, 'ArrowUp', true, bounds)).toEqual({ x: 0, y: -20 });
  });

  it('keeps the offset centered when the image does not overflow the view', () => {
    const fitted = { drawnHeight: 100, drawnWidth: 100, viewHeight: 100, viewWidth: 100 };
    expect(nudgeOffset(origin, 'ArrowRight', true, fitted)).toEqual({ x: 0, y: 0 });
  });

  it('returns null for keys that do not pan', () => {
    expect(nudgeOffset(origin, 'Enter', false, bounds)).toBeNull();
    expect(nudgeOffset(origin, 'a', true, bounds)).toBeNull();
  });
});

describe('panPercent', () => {
  it('reports the pan as a percentage of the available range', () => {
    expect(panPercent(25, 100, 200)).toBe(50);
    expect(panPercent(-50, 100, 200)).toBe(-100);
    expect(panPercent(0, 100, 200)).toBe(0);
  });

  it('rounds to whole percentages', () => {
    expect(panPercent(10, 100, 130)).toBe(67);
  });

  it('reports 0 when the image does not overflow the view', () => {
    expect(panPercent(0, 100, 100)).toBe(0);
    expect(panPercent(0, 100, 80)).toBe(0);
  });
});
