'use client';

import Button from '@/components/ui/Button';

interface ProductTableActionsProps {
  productId: string;
  productName: string;
  isDeleting: boolean;
  onDelete: (id: string, name: string) => void;
}

export default function ProductTableActions({
  productId,
  productName,
  isDeleting,
  onDelete,
}: ProductTableActionsProps) {
  return (
    <div className="flex items-center gap-2 justify-end">
      <Button variant="ghost" size="sm" href={`/admin/productos/${productId}`}>
        Editar
      </Button>
      <Button
        variant="destructive"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(productId, productName);
        }}
        disabled={isDeleting}
      >
        {isDeleting ? 'Eliminando…' : 'Eliminar'}
      </Button>
    </div>
  );
}
