'use client';

import { type Ref, useState } from 'react';
import { toast } from 'sonner';

import Button from '@/components/ui/Button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import EmptyState from '@/components/ui/EmptyState';
import SortableList from '@/components/ui/SortableList';
import DragHandle from '@/components/ui/SortableList/DragHandle';
import SortableItem from '@/components/ui/SortableList/SortableItem';
import ToggleSwitch from '@/components/ui/ToggleSwitch';
import { deleteHeroSlide, toggleHeroSlideStatus } from '@/features/admin/actions/heroSlides';
import type { HeroSlide } from '@/lib/database/repositories/heroSlides';
import { isPublished } from '@/lib/publishing';

import { useHeroSlideReorder } from './useHeroSlideReorder';

interface HeroSlideListProps {
  slides: HeroSlide[];
}

function isSlidePublished(slide: HeroSlide, now: Date): boolean {
  return isPublished({ ends_at: slide.endsAt, is_active: slide.isActive, starts_at: slide.startsAt }, now);
}

export default function HeroSlideList({ slides: initialSlides }: HeroSlideListProps) {
  const [items, setItems] = useState(initialSlides);
  const [pendingDelete, setPendingDelete] = useState<HeroSlide | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const reorder = useHeroSlideReorder(items, applyOrder);

  function applyOrder(orderedIds: string[]) {
    setItems((current) => {
      const byId = new Map(current.map((slide) => [slide.id, slide]));
      const reordered = orderedIds
        .map((id) => byId.get(id))
        .filter((slide): slide is HeroSlide => slide !== undefined);
      return reordered.length === current.length ? reordered : current;
    });
  }

  async function handleToggle(id: string, isActive: boolean) {
    const previous = items;
    setItems((current) => current.map((slide) => (
      isActive
        ? { ...slide, isActive: slide.id === id }
        : slide.id === id ? { ...slide, isActive: false } : slide
    )));
    const result = await toggleHeroSlideStatus(id, isActive);
    if (!result.success) {
      setItems(previous);
      toast.error(`No se pudo cambiar el estado: ${result.error ?? 'Error desconocido'}`);
      return;
    }
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    setIsDeleting(true);
    try {
      const result = await deleteHeroSlide(pendingDelete.id);
      if (!result.success) {
        toast.error(`No se pudo eliminar: ${result.error ?? 'Error desconocido'}`);
        return;
      }
      setItems((current) => current.filter((slide) => slide.id !== pendingDelete.id));
      setPendingDelete(null);
      toast.success('Slide eliminado.');
    } finally {
      setIsDeleting(false);
    }
  }

  if (items.length === 0) {
    return (
      <EmptyState
        message="Todavía no hay slides. El sitio sigue mostrando el hero actual hasta que publiques uno."
        action={<Button href="/admin/inicio/hero/nuevo" size="sm">Agregar slide</Button>}
      />
    );
  }

  const now = new Date();
  const hasVisibleSlide = items.some((slide) => isSlidePublished(slide, now));
  const activeCount = items.filter((slide) => slide.isActive).length;
  const isLastSlide = items.length <= 1;

  return (
    <div className="space-y-3">
      {hasVisibleSlide ? null : (
        <p className="rounded-xl border border-(--color-border) bg-(--color-surface) px-4 py-3 text-sm text-(--color-dark)">
          Ningún slide está visible. Activa uno para que la portada muestre hero.
        </p>
      )}
      <SortableList
        ids={items.map((slide) => slide.id)}
        getItemLabel={(id) => {
          const slide = items.find((item) => item.id === id);
          return slide?.name || slide?.title || 'el slide';
        }}
        onReorder={(ids) => void reorder.handleReorder(ids)}
      >
        <ul className="space-y-3">
          {items.map((slide) => (
            <SortableItem key={slide.id} id={slide.id}>
              {({ dragHandleProps, isDragging, setNodeRef, style }) => (
                <li
                  ref={setNodeRef as Ref<HTMLLIElement>}
                  style={style}
                  className={`flex items-center gap-3 rounded-xl border border-(--color-border) bg-(--color-white) p-3 ${
                    isSlidePublished(slide, now) ? '' : 'opacity-60'
                  }`}
                >
                  <DragHandle handleProps={dragHandleProps} label={slide.name || slide.title} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-(--color-dark)">{slide.name || slide.title}</p>
                    <p className="truncate text-xs text-(--color-muted)">{slide.title}</p>
                  </div>
                  <ToggleSwitch
                    checked={slide.isActive}
                    disabled={isDragging || (slide.isActive && activeCount <= 1)}
                    label={`${slide.isActive ? 'Ocultar' : 'Mostrar'} ${slide.name || slide.title}`}
                    onChange={(checked) => void handleToggle(slide.id, checked)}
                  />
                  <Button href={`/admin/inicio/hero/${slide.id}`} variant="ghost" size="sm">Editar</Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={isLastSlide || (slide.isActive && activeCount <= 1)}
                    onClick={() => setPendingDelete(slide)}
                  >
                    Eliminar
                  </Button>
                </li>
              )}
            </SortableItem>
          ))}
        </ul>
      </SortableList>
      <ConfirmDialog
        open={pendingDelete !== null}
        title="Eliminar slide"
        description={pendingDelete ? `¿Eliminar “${pendingDelete.title}”? Esta acción no se puede deshacer.` : ''}
        loading={isDeleting}
        variant="destructive"
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        onConfirm={() => void handleConfirmDelete()}
      />
    </div>
  );
}
