import { Product, Category } from '@/features/catalog/types';

export const categories: Category[] = [
  {
    id: 'cat-001',
    name: 'Ramos buchones',
    slug: 'ramos-buchones',
    description: 'Elegantes ramos de rosas en caja, perfectos para ocasiones especiales',
  },
  {
    id: 'cat-002',
    name: 'Flores amarillas',
    slug: 'flores-amarillas',
    description: 'Radiantes arreglos de flores en tonos amarillos, perfectos para iluminar cualquier momento',
  },
];

export const products: Product[] = [
  {
    id: 'prod-001',
    name: 'Ramo Buchon Rojo Pasión',
    slug: 'ramo-buchon-rojo-pasion',
    description: 'Exquisito ramo de 24 rosas rojas en caja negra, ideal para expresar amor y pasión',
    price: 249.9,
    categoryId: 'cat-001',
    imageUrl: 'https://via.placeholder.com/400x300',
  },
  {
    id: 'prod-002',
    name: 'Ramo Buchon Rosa Dulzura',
    slug: 'ramo-buchon-rosa-dulzura',
    description: 'Delicado ramo de 24 rosas rosadas en caja blanca, perfecto para celebraciones románticas',
    price: 229.9,
    categoryId: 'cat-001',
    imageUrl: 'https://via.placeholder.com/400x300',
  },
  {
    id: 'prod-003',
    name: 'Sol Radiante',
    slug: 'sol-radiante',
    description: 'Radiante arreglo de girasoles y flores amarillas en base elegante',
    price: 189.9,
    categoryId: 'cat-002',
    imageUrl: 'https://via.placeholder.com/400x300',
  },
  {
    id: 'prod-004',
    name: 'Dorado Atardecer',
    slug: 'dorado-atardecer',
    description: 'Hermoso ramo de rosas amarillas, tulipanes y follaje premium',
    price: 159.9,
    categoryId: 'cat-002',
    imageUrl: 'https://via.placeholder.com/400x300',
  },
];
