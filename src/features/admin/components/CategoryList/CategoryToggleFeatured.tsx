'use client';

/**
 * CategoryToggleFeatured — botón estrella para alternar `is_featured`.
 * Optimista con rollback + toast (consistente con CategoryToggleStatus).
 */

import { Star } from 'lucide-react';
import { toast } from 'sonner';
import { Button as ShadcnButton } from '@/components/ui/primitives/button';
import { toggleCategoryFeatured } from '@/features/admin/actions/categories';

interface CategoryToggleFeaturedProps {
  id: string;
  name: string;
  isFeatured: boolean;
  onLocalChange: (id: string, isFeatured: boolean) => void;
}

export default function CategoryToggleFeatured({
  id,
  name,
  isFeatured,
  onLocalChange,
}: CategoryToggleFeaturedProps) {
  async function handleClick() {
    const next = !isFeatured;
    onLocalChange(id, next);
    const result = await toggleCategoryFeatured(id, next);
    if (!result.success) {
      onLocalChange(id, !next);
      toast.error(`Error al actualizar destacada: ${result.error ?? 'Error desconocido'}`);
    }
  }

  return (
    <ShadcnButton
      variant="ghost"
      size="icon"
      onClick={() => void handleClick()}
      className="text-muted hover:text-secondary"
      style={{ color: isFeatured ? 'var(--color-secondary)' : undefined }}
      aria-label={`${isFeatured ? 'Quitar de destacadas' : 'Marcar como destacada'} ${name}`}
      aria-pressed={isFeatured}
      title={isFeatured ? 'Categoría destacada' : 'Categoría normal'}
    >
      <Star className="size-4" fill={isFeatured ? 'currentColor' : 'none'} />
    </ShadcnButton>
  );
}
