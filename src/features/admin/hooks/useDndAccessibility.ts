/**
 * useDndAccessibility — anuncia eventos de drag-and-drop en español vía un
 * `aria-live` region propio. Pensado para `@dnd-kit/react` v0.3.2, donde la
 * configuración del plugin `Accessibility` por defecto no expone announcements
 * traducibles a través de la API pública.
 *
 * Estrategia: enchufar handlers en `DragDropProvider` que actualizan un mensaje
 * en español. El consumidor renderiza un `<DndLiveRegion message={message} />`
 * adyacente para que NVDA/JAWS lo lea.
 */

import type { DragDropEvents } from '@dnd-kit/react';
import { useCallback, useState } from 'react';

interface Identifiable {
  id: string;
}

type DragStartHandler = NonNullable<DragDropEvents['dragstart']>;
type DragOverHandler = NonNullable<DragDropEvents['dragover']>;
type DragEndHandler = NonNullable<DragDropEvents['dragend']>;

interface DndAccessibility {
  message: string;
  onDragStart: DragStartHandler;
  onDragOver: DragOverHandler;
  onDragEnd: DragEndHandler;
}

export function useDndAccessibility<T extends Identifiable>(
  items: T[],
  getName: (item: T) => string,
): DndAccessibility {
  const [message, setMessage] = useState<string>('');

  const labelOf = useCallback(
    (id: string | number | symbol | undefined | null): string => {
      if (id === undefined || id === null) return '';
      const idStr = String(id);
      const found = items.find((item) => item.id === idStr);
      return found ? getName(found) : idStr;
    },
    [items, getName],
  );

  const onDragStart = useCallback<DragStartHandler>(
    (event) => {
      const sourceId = event.operation.source?.id;
      setMessage(`Comenzaste a arrastrar ${labelOf(sourceId)}.`);
    },
    [labelOf],
  );

  const onDragOver = useCallback<DragOverHandler>(
    (event) => {
      const sourceId = event.operation.source?.id;
      const targetId = event.operation.target?.id;
      setMessage(
        targetId
          ? `${labelOf(sourceId)} está sobre ${labelOf(targetId)}.`
          : `${labelOf(sourceId)} ya no está sobre nada.`,
      );
    },
    [labelOf],
  );

  const onDragEnd = useCallback<DragEndHandler>(
    (event) => {
      const sourceId = event.operation.source?.id;
      const targetId = event.operation.target?.id;
      if (event.canceled) {
        setMessage(`Cancelaste el arrastre de ${labelOf(sourceId)}.`);
        return;
      }
      setMessage(
        targetId
          ? `Soltaste ${labelOf(sourceId)} sobre ${labelOf(targetId)}.`
          : `Soltaste ${labelOf(sourceId)}.`,
      );
    },
    [labelOf],
  );

  return { message, onDragStart, onDragOver, onDragEnd };
}
