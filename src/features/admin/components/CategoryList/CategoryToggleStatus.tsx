'use client';

/**
 * CategoryToggleStatus — toggle optimistic de `is_active` con rollback + toast
 * en caso de fallo. Aislado del row para que el resto del row no re-renderee
 * cuando solo cambia este estado.
 */

import { toast } from 'sonner';

import ToggleSwitch from '@/components/ui/ToggleSwitch';
import { toggleCategoryStatus } from '@/features/admin/actions/categories';

interface CategoryToggleStatusProps {
  id: string;
  name: string;
  isActive: boolean;
  onLocalChange: (id: string, isActive: boolean) => void;
}

export default function CategoryToggleStatus({
  id,
  name,
  isActive,
  onLocalChange,
}: CategoryToggleStatusProps) {
  async function handleChange(checked: boolean) {
    onLocalChange(id, checked);
    const result = await toggleCategoryStatus(id, checked);
    if (!result.success) {
      onLocalChange(id, !checked);
      toast.error(`Error al cambiar estado: ${result.error ?? 'Error desconocido'}`);
    }
  }

  return (
    <ToggleSwitch
      checked={isActive}
      label={`${isActive ? 'Desactivar' : 'Activar'} ${name}`}
      onChange={(checked) => void handleChange(checked)}
    />
  );
}
