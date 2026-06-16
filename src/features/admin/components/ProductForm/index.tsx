'use client';

import Button from '@/components/ui/Button';
import { FormError } from '@/components/ui/FormField';
import type { AdminProductRow } from '@/features/admin/queries/products';
import type { CategoryRow } from '@/lib/db/rows';

import ColorManager, { type ColorOption } from './ColorManager';
import FlowerTypeManager from './FlowerTypeManager';
import ProductFormFields from './ProductFormFields';
import ProductFormFlags from './ProductFormFlags';
import ProductFormImages from './ProductFormImages';
import ProductFormIncludes from './ProductFormIncludes';
import ProductFormPriceVariants from './ProductFormPriceVariants';
import { useProductForm } from './useProductForm';

interface FlowerTypeOption {
  id: string;
  name: string;
}

interface ProductFormProps {
  product?: AdminProductRow;
  categories: CategoryRow[];
  flowerTypes: FlowerTypeOption[];
  productColors: ColorOption[];
  onSuccess?: () => void;
}

export default function ProductForm({
  product,
  categories,
  flowerTypes,
  productColors,
  onSuccess,
}: ProductFormProps) {
  const f = useProductForm({ product, onSuccess });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        f.submit();
      }}
      className="space-y-6 max-w-3xl"
      noValidate
    >
      <ProductFormFields {...f} categories={categories} />
      <ProductFormImages {...f} />
      <ColorManager
        productColors={productColors}
        pendingNewColors={f.pendingNewColors}
        selected={f.form.colors}
        onToggle={(name) => f.toggleArrayItem('colors', name)}
        onAddPending={f.addPendingColor}
        onItemRenamedInForm={(oldName, newName) => f.renameInForm('colors', oldName, newName)}
        onItemRemovedFromForm={(name) => f.removeFromForm('colors', name)}
        onError={f.reportTransientError}
      />
      <FlowerTypeManager
        flowerTypes={flowerTypes}
        pendingNewTypes={f.pendingNewTypes}
        selected={f.form.flowerTypes}
        onToggle={(name) => f.toggleArrayItem('flowerTypes', name)}
        onAddPending={f.addPendingFlowerType}
        onItemRenamedInForm={(oldName, newName) => f.renameInForm('flowerTypes', oldName, newName)}
        onItemRemovedFromForm={(name) => f.removeFromForm('flowerTypes', name)}
        onError={f.reportTransientError}
      />
      <ProductFormIncludes {...f} />
      <ProductFormPriceVariants {...f} />
      <ProductFormFlags {...f} />

      <FormError message={f.error} />

      <div>
        <Button type="submit" variant="primary" size="md" loading={f.isPending}>
          {f.isPending ? 'Guardando…' : product ? 'Guardar producto' : 'Crear producto'}
        </Button>
      </div>
    </form>
  );
}
