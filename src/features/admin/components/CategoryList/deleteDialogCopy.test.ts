import { describe, expect, it } from 'vitest';

import {
  cascadeConfirmDescription,
  cascadeHint,
  deleteConfirmLabel,
  deleteDescription,
  isDeleteConfirmDisabled,
  reassignCandidates,
} from './deleteDialogCopy';

const empty = { id: 'a', name: 'Rosas', productCount: 0 };
const single = { id: 'a', name: 'Rosas', productCount: 1 };
const many = { id: 'a', name: 'Rosas', productCount: 3 };

describe('deleteDescription', () => {
  it('is empty without a target', () => {
    expect(deleteDescription(null)).toBe('');
  });

  it('asks for confirmation when the category has no products', () => {
    expect(deleteDescription(empty)).toBe('¿Eliminar la categoría "Rosas"?');
  });

  it.each([
    [single, 'La categoría "Rosas" tiene 1 producto.'],
    [many, 'La categoría "Rosas" tiene 3 productos.'],
  ])('reports the product count', (target, expected) => {
    expect(deleteDescription(target)).toBe(expected);
  });
});

describe('deleteConfirmLabel', () => {
  it.each([
    [null, 'reassign', 'Eliminar'],
    [empty, 'cascade', 'Eliminar'],
    [many, 'reassign', 'Mover y eliminar'],
    [many, 'cascade', 'Eliminar todo'],
  ] as const)('labels %o in %s mode as %s', (target, mode, expected) => {
    expect(deleteConfirmLabel(target, mode)).toBe(expected);
  });
});

describe('isDeleteConfirmDisabled', () => {
  it('requires a destination when reassigning products', () => {
    expect(isDeleteConfirmDisabled(many, 'reassign', '')).toBe(true);
    expect(isDeleteConfirmDisabled(many, 'reassign', 'b')).toBe(false);
  });

  it('never blocks cascade deletes, empty categories or a missing target', () => {
    expect(isDeleteConfirmDisabled(many, 'cascade', '')).toBe(false);
    expect(isDeleteConfirmDisabled(empty, 'reassign', '')).toBe(false);
    expect(isDeleteConfirmDisabled(null, 'reassign', '')).toBe(false);
  });
});

describe('cascade copy', () => {
  it('pluralizes the hint', () => {
    expect(cascadeHint(single)).toBe('Se eliminarán permanentemente 1 producto');
    expect(cascadeHint(many)).toBe('Se eliminarán permanentemente 3 productos');
  });

  it('describes the permanent cascade delete', () => {
    expect(cascadeConfirmDescription(many)).toBe(
      'Se eliminará la categoría "Rosas" junto con 3 productos de forma permanente. Esta acción no se puede deshacer.',
    );
  });
});

describe('reassignCandidates', () => {
  it('excludes the category being deleted and keeps the order', () => {
    const categories = [
      { id: 'b', name: 'Tulipanes' },
      { id: 'a', name: 'Rosas' },
      { id: 'c', name: 'Lirios' },
    ];
    expect(reassignCandidates(categories, 'a').map((category) => category.id)).toEqual(['b', 'c']);
  });
});
