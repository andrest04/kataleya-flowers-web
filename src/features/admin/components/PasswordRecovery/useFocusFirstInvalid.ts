import { useEffect, useRef } from 'react';

export function useFocusFirstInvalid<T extends HTMLElement>(attempt: number) {
  const containerRef = useRef<T>(null);

  useEffect(() => {
    if (attempt === 0) return;
    const firstInvalid = containerRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
    firstInvalid?.focus();
  }, [attempt]);

  return containerRef;
}
