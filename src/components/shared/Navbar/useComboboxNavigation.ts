"use client";

import type { KeyboardEvent } from "react";
import { useEffect, useState } from "react";

import { nextActiveIndex } from "./comboboxNavigation";

const ARROW_KEYS = new Set(["ArrowDown", "ArrowUp"]);
const EDGE_KEYS = new Set(["Home", "End"]);

export interface ComboboxOptionProps {
  id: string;
  role: "option";
  "aria-selected": boolean;
}

interface UseComboboxNavigationOptions<T> {
  idPrefix: string;
  items: readonly T[];
  inputValue: string;
  onSelect: (item: T) => void;
}

interface ActiveOption<T> {
  index: number;
  items: readonly T[];
  inputValue: string;
}

interface UseComboboxNavigationResult {
  activeIndex: number;
  activeDescendant: string | undefined;
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  getOptionProps: (index: number) => ComboboxOptionProps;
}

export function useComboboxNavigation<T>({
  idPrefix,
  items,
  inputValue,
  onSelect,
}: UseComboboxNavigationOptions<T>): UseComboboxNavigationResult {
  const [active, setActive] = useState<ActiveOption<T>>({
    index: -1,
    items,
    inputValue,
  });

  const isCurrent = active.items === items && active.inputValue === inputValue;
  const activeIndex = isCurrent && active.index < items.length ? active.index : -1;
  const getOptionId = (index: number) => `${idPrefix}-option-${index}`;
  const activeDescendant = activeIndex >= 0 ? getOptionId(activeIndex) : undefined;

  useEffect(() => {
    if (!activeDescendant) return;
    document
      .getElementById(activeDescendant)
      ?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [activeDescendant]);

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing || items.length === 0) return;

    const isArrow = ARROW_KEYS.has(event.key);
    const isEdge = EDGE_KEYS.has(event.key) && activeIndex >= 0;
    if (isArrow || isEdge) {
      event.preventDefault();
      setActive({
        index: nextActiveIndex(activeIndex, event.key, items.length),
        items,
        inputValue,
      });
      return;
    }

    if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      onSelect(items[activeIndex]);
    }
  };

  const getOptionProps = (index: number): ComboboxOptionProps => ({
    id: getOptionId(index),
    role: "option",
    "aria-selected": index === activeIndex,
  });

  return { activeIndex, activeDescendant, onKeyDown, getOptionProps };
}
