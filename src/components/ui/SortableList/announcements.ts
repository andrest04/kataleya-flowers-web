import type { Announcements, ScreenReaderInstructions } from '@dnd-kit/core';

export const sortableScreenReaderInstructions: ScreenReaderInstructions = {
  draggable:
    'Para reordenar, presiona la barra espaciadora para levantar el elemento. Usa las flechas para moverlo, la barra espaciadora otra vez para soltarlo y Escape para cancelar.',
};

export function createSortableAnnouncements(getItemLabel: (id: string) => string): Announcements {
  const labelOf = (id: string | number) => getItemLabel(String(id));

  return {
    onDragStart: ({ active }) => `Levantaste ${labelOf(active.id)}.`,
    onDragOver: ({ active, over }) =>
      over && over.id !== active.id
        ? `${labelOf(active.id)} se movió sobre ${labelOf(over.id)}.`
        : `${labelOf(active.id)} ya no está sobre otro elemento.`,
    onDragEnd: ({ active, over }) =>
      over
        ? `${labelOf(active.id)} se soltó en la posición de ${labelOf(over.id)}.`
        : `${labelOf(active.id)} se soltó sin cambiar de posición.`,
    onDragCancel: ({ active }) =>
      `Cancelaste el movimiento. ${labelOf(active.id)} volvió a su posición original.`,
  };
}
