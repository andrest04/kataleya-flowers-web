'use client';

import { Star, Trash2 } from 'lucide-react';
import { useId } from 'react';

import AppwriteImage from '@/components/ui/AppwriteImage';
import SortableList from '@/components/ui/SortableList';
import DragHandle from '@/components/ui/SortableList/DragHandle';
import SortableItem from '@/components/ui/SortableList/SortableItem';

interface ProductGalleryManagerProps {
  altTexts: Record<string, string>;
  images: string[];
  onChangeAlt: (url: string, alt: string) => void;
  onRemove: (url: string) => void;
  onReorder: (urls: string[]) => void;
  onSetPrimary: (url: string) => void;
}

export default function ProductGalleryManager({
  altTexts,
  images,
  onChangeAlt,
  onRemove,
  onReorder,
  onSetPrimary,
}: ProductGalleryManagerProps) {
  const altFieldId = useId();

  if (images.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-sm text-(--color-muted)">
        Arrastra para cambiar el orden. La primera foto es la principal: es la que se ve en el
        catálogo y al compartir el producto.
      </p>
      <SortableList
        ids={images}
        getItemLabel={(url) => altTexts[url]?.trim() || `la foto ${images.indexOf(url) + 1}`}
        onReorder={onReorder}
      >
        <ul className="space-y-2">
          {images.map((url, index) => (
            <SortableItem key={url} id={url}>
              {(sortableProps) => (
                <li
                  ref={sortableProps.setNodeRef as React.Ref<HTMLLIElement>}
                  className="flex items-start gap-3 rounded-xl p-3"
                  style={{
                    background: 'var(--color-white)',
                    border: '1px solid var(--color-border)',
                    ...sortableProps.style,
                  }}
                >
                  <DragHandle
                    handleProps={sortableProps.dragHandleProps}
                    label={`la foto ${index + 1}`}
                  />
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-lg">
                    <AppwriteImage src={url} alt="" fill sizes="64px" className="object-cover" />
                    {index === 0 ? (
                      <span
                        className="absolute inset-x-0 bottom-0 py-0.5 text-center text-[10px] font-semibold uppercase"
                        style={{ background: 'var(--color-primary)', color: 'var(--color-white)' }}
                      >
                        Principal
                      </span>
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <label
                      htmlFor={`${altFieldId}-${index}`}
                      className="mb-1 block text-xs font-medium text-(--color-muted)"
                    >
                      Describe esta foto (para lectores de pantalla y buscadores)
                    </label>
                    <input
                      id={`${altFieldId}-${index}`}
                      type="text"
                      value={altTexts[url] ?? ''}
                      maxLength={500}
                      placeholder="Ej. Ramo de 12 rosas rojas con papel kraft"
                      onChange={(event) => onChangeAlt(url, event.target.value)}
                      className="h-10 w-full rounded-lg px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-primary)"
                      style={{ border: '1px solid var(--color-border)' }}
                    />
                  </div>
                  <div className="flex shrink-0 flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => onSetPrimary(url)}
                      disabled={index === 0}
                      aria-label={
                        index === 0
                          ? `La foto ${index + 1} ya es la principal`
                          : `Usar la foto ${index + 1} como principal`
                      }
                      className="flex size-8 items-center justify-center rounded-lg transition-colors hover:bg-(--color-surface) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-primary) disabled:cursor-default"
                    >
                      <Star
                        className="size-4"
                        aria-hidden="true"
                        strokeWidth={1.8}
                        style={{
                          color: index === 0 ? 'var(--color-gold-text)' : 'var(--color-muted)',
                          fill: index === 0 ? 'var(--color-secondary)' : 'transparent',
                        }}
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemove(url)}
                      aria-label={`Quitar la foto ${index + 1}`}
                      className="flex size-8 items-center justify-center rounded-lg text-(--color-muted) transition-colors hover:bg-(--color-surface) hover:text-(--color-primary) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-primary)"
                    >
                      <Trash2 className="size-4" aria-hidden="true" strokeWidth={1.8} />
                    </button>
                  </div>
                </li>
              )}
            </SortableItem>
          ))}
        </ul>
      </SortableList>
    </div>
  );
}
