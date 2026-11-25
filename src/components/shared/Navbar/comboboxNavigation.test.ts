import { describe, expect, it } from "vitest";

import { nextActiveIndex } from "./comboboxNavigation";

describe("nextActiveIndex", () => {
  it("moves from no selection to the first option on ArrowDown", () => {
    expect(nextActiveIndex(-1, "ArrowDown", 3)).toBe(0);
  });

  it("moves from no selection to the last option on ArrowUp", () => {
    expect(nextActiveIndex(-1, "ArrowUp", 3)).toBe(2);
  });

  it("steps forward and backward through the options", () => {
    expect(nextActiveIndex(0, "ArrowDown", 3)).toBe(1);
    expect(nextActiveIndex(2, "ArrowUp", 3)).toBe(1);
  });

  it("wraps at both ends", () => {
    expect(nextActiveIndex(2, "ArrowDown", 3)).toBe(0);
    expect(nextActiveIndex(0, "ArrowUp", 3)).toBe(2);
  });

  it("jumps to the first and last options with Home and End", () => {
    expect(nextActiveIndex(1, "Home", 3)).toBe(0);
    expect(nextActiveIndex(1, "End", 3)).toBe(2);
    expect(nextActiveIndex(-1, "End", 4)).toBe(3);
  });

  it("returns -1 when there are no options", () => {
    for (const key of ["ArrowDown", "ArrowUp", "Home", "End"]) {
      expect(nextActiveIndex(-1, key, 0)).toBe(-1);
      expect(nextActiveIndex(2, key, 0)).toBe(-1);
    }
  });

  it("keeps the current index for keys it does not handle", () => {
    expect(nextActiveIndex(1, "Enter", 3)).toBe(1);
    expect(nextActiveIndex(-1, "a", 3)).toBe(-1);
  });

  it("clamps a stale index that exceeds the option count", () => {
    expect(nextActiveIndex(5, "ArrowDown", 3)).toBe(0);
    expect(nextActiveIndex(5, "Enter", 3)).toBe(-1);
  });
});
