'use client';

import { type Ref, useMemo, useState } from 'react';
import { toast } from 'sonner';

import Button from '@/components/ui/Button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import SortableList from '@/components/ui/SortableList';
import DragHandle from '@/components/ui/SortableList/DragHandle';
import SortableItem from '@/components/ui/SortableList/SortableItem';
import ToggleSwitch from '@/components/ui/ToggleSwitch';
import { deletePromoPreset, togglePromoPresetStatus } from '@/features/admin/actions/promoBanners';
import type { PromoBannerRow } from '@/lib/db/rows';
import { promoPresetKey } from '@/lib/promoPresetKey';
import { isPublished } from '@/lib/publishing';

import { usePromoBannerReorder } from './usePromoBannerReorder';

interface PromoBannerPreset {
  banners: PromoBannerRow[];
  isActive: boolean;
  key: string;
  name: string;
}

function groupPresets(banners: PromoBannerRow[]): PromoBannerPreset[] {
  const groups = new Map<string, PromoBannerRow[]>();
  for (const banner of banners) {
    const key = promoPresetKey(banner);
    const members = groups.get(key) ?? [];
    members.push(banner);
    groups.set(key, members);
  }
  return [...groups.entries()].map(([key, members]) => ({
    banners: members,
    isActive: members.some((banner) => banner.is_active),
    key,
    name: members[0]?.name || members[0]?.title || 'Preset',
  }));
}

interface PromoBannerListProps {
  banners: PromoBannerRow[];
  liveTitles: string[];
}

export default function PromoBannerList({
  banners: initialBanners,
  liveTitles,
}: PromoBannerListProps) {
  const [items, setItems] = useState(initialBanners);
  const [pendingDelete, setPendingDelete] = useState<PromoBannerPreset | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const presets = useMemo(() => groupPresets(items), [items]);
  const reorder = usePromoBannerReorder(presets.map((preset) => preset.key), applyOrder);

  function applyOrder(orderedKeys: string[]) {
    setItems((current) => {
      const groups = groupPresets(current);
      const byKey = new Map(groups.map((preset) => [preset.key, preset.banners]));
      const reordered = orderedKeys.flatMap((key) => byKey.get(key) ?? []);
      return reordered.length === current.length ? reordered : current;
    });
  }

  async function handleToggle(key: string, isActive: boolean) {
    const previous = items;
    setItems((current) => current.map((banner) => (
      isActive
        ? { ...banner, is_active: promoPresetKey(banner) === key }
        : promoPresetKey(banner) === key ? { ...banner, is_active: false } : banner
    )));
    const result = await togglePromoPresetStatus(key, isActive);
    if (!result.success) {
      setItems(previous);
      toast.error(`No se pudo cambiar el estado: ${result.error ?? 'Error desconocido'}`);
    }
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    setIsDeleting(true);
    try {
      const result = await deletePromoPreset(pendingDelete.key);
      if (!result.success) {
        toast.error(`No se pudo eliminar: ${result.error ?? 'Error desconocido'}`);
        return;
      }
      setItems((current) => current.filter((banner) => promoPresetKey(banner) !== pendingDelete.key));
      setPendingDelete(null);
      toast.success('Banners eliminados.');
    } finally {
      setIsDeleting(false);
    }
  }

  if (presets.length === 0) {
    const liveName = liveTitles[0] || 'Portada';
    const liveSubtitle = liveTitles.join(' · ');
    return (
      <ul className="space-y-3">
        <li className="flex items-center gap-3 rounded-xl border border-(--color-border) bg-(--color-white) p-3">
          <span className="size-8 shrink-0" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-(--color-dark)">{liveName}</p>
            <p className="truncate text-xs text-(--color-muted)">{liveSubtitle}</p>
          </div>
          <ToggleSwitch
            checked
            disabled
            label={`Mostrar ${liveName}`}
            onChange={() => undefined}
          />
          <Button href="/admin/inicio/banners/nuevo" variant="ghost" size="sm">
            Editar
          </Button>
          <Button type="button" variant="ghost" size="sm" disabled>
            Eliminar
          </Button>
        </li>
      </ul>
    );
  }

  const now = new Date();
  const hasVisiblePreset = items.some((banner) => isPublished(banner, now));
  const activeCount = presets.filter((preset) => preset.isActive).length;
  const isLastPreset = presets.length <= 1;

  return (
    <div className="space-y-3">
      {hasVisiblePreset ? null : (
        <p className="rounded-xl border border-(--color-border) bg-(--color-surface) px-4 py-3 text-sm text-(--color-dark)">
          Ninguno está visible. Activa uno para que la portada muestre banners.
        </p>
      )}
      <SortableList
        ids={presets.map((preset) => preset.key)}
        getItemLabel={(id) => presets.find((preset) => preset.key === id)?.name || 'los banners'}
        onReorder={(ids) => void reorder.handleReorder(ids)}
      >
        <ul className="space-y-3">
          {presets.map((preset) => {
            const visible = preset.banners.some((banner) => isPublished(banner, now));
            return (
              <SortableItem key={preset.key} id={preset.key}>
                {({ dragHandleProps, isDragging, setNodeRef, style }) => (
                  <li
                    ref={setNodeRef as Ref<HTMLLIElement>}
                    style={style}
                    className={`flex items-center gap-3 rounded-xl border border-(--color-border) bg-(--color-white) p-3 ${
                      visible ? '' : 'opacity-60'
                    }`}
                  >
                    <DragHandle handleProps={dragHandleProps} label={preset.name} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-(--color-dark)">{preset.name}</p>
                      <p className="truncate text-xs text-(--color-muted)">
                        {preset.banners.map((banner) => banner.title).join(' · ')}
                      </p>
                    </div>
                    <ToggleSwitch
                      checked={preset.isActive}
                      disabled={isDragging || (preset.isActive && activeCount <= 1)}
                      label={`${preset.isActive ? 'Ocultar' : 'Mostrar'} ${preset.name}`}
                      onChange={(checked) => void handleToggle(preset.key, checked)}
                    />
                    <Button href={`/admin/inicio/banners/${preset.banners[0]?.id}`} variant="ghost" size="sm">
                      Editar
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={isLastPreset || (preset.isActive && activeCount <= 1)}
                      onClick={() => setPendingDelete(preset)}
                    >
                      Eliminar
                    </Button>
                  </li>
                )}
              </SortableItem>
            );
          })}
        </ul>
      </SortableList>
      <ConfirmDialog
        open={pendingDelete !== null}
        title="Eliminar banners"
        description={pendingDelete ? `¿Eliminar “${pendingDelete.name}”? Esta acción no se puede deshacer.` : ''}
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
