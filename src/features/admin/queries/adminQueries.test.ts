import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthError } from '@/lib/auth/errors';

import { getCategoryIdsWithActiveProducts } from './adminFilters';
import { getAdminCategories, getAdminCategoryById } from './categories';
import { getAdminDiscoverTileById, getAdminDiscoverTiles } from './discoverTiles';
import { getFlowerTypes, getFlowerTypeUsage } from './flowerTypes';
import { getAdminHeroSlideById, getAdminHeroSlides } from './heroSlides';
import { getProductColors, getProductColorUsage } from './productColors';
import { getAdminProductById, getAdminProductCategoryCounts, getAdminProductList } from './products';
import {
  getAdminPromoBannerById,
  getAdminPromoBanners,
  getAdminPromoPresetByBannerId,
} from './promoBanners';
import { getAdminTestimonialById, getAdminTestimonials } from './testimonials';
import { getAdminValuePropById, getAdminValueProps } from './valueProps';

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  productsRepository: {
    listActiveJoined: vi.fn(),
    listAdminCategoryCounts: vi.fn(),
    listAdminPage: vi.fn(),
    findAdminById: vi.fn(),
  },
  categoryRepository: {
    listAll: vi.fn(),
    findById: vi.fn(),
  },
  discoverTileRepository: {
    list: vi.fn(),
    findById: vi.fn(),
  },
  taxonomyRepository: {
    listFlowerTypes: vi.fn(),
    getFlowerTypeUsage: vi.fn(),
    listColors: vi.fn(),
    getColorUsage: vi.fn(),
  },
  heroSlideRepository: {
    list: vi.fn(),
    findById: vi.fn(),
  },
  promoBannerRepository: {
    list: vi.fn(),
    findById: vi.fn(),
  },
  listPromoBannersByPreset: vi.fn(),
  testimonialRepository: {
    list: vi.fn(),
    findById: vi.fn(),
  },
  valuePropRepository: {
    list: vi.fn(),
    findById: vi.fn(),
  },
}));

vi.mock('@/lib/auth', async () => {
  const errors = await vi.importActual<typeof import('@/lib/auth/errors')>('@/lib/auth/errors');
  return {
    auth: { requireAdmin: mocks.requireAdmin },
    AuthError: errors.AuthError,
  };
});

vi.mock('@/lib/database/repositories/products', () => ({
  productsRepository: mocks.productsRepository,
}));

vi.mock('@/lib/database/repositories/categories', () => ({
  categoryRepository: mocks.categoryRepository,
}));

vi.mock('@/lib/database/repositories/discoverTiles', () => ({
  discoverTileRepository: mocks.discoverTileRepository,
}));

vi.mock('@/lib/database/repositories/taxonomy', () => ({
  taxonomyRepository: mocks.taxonomyRepository,
}));

vi.mock('@/lib/database/repositories/heroSlides', () => ({
  heroSlideRepository: mocks.heroSlideRepository,
}));

vi.mock('@/lib/database/repositories/promoBanners', () => ({
  promoBannerRepository: mocks.promoBannerRepository,
  listPromoBannersByPreset: mocks.listPromoBannersByPreset,
}));

vi.mock('@/lib/database/repositories/testimonials', () => ({
  testimonialRepository: mocks.testimonialRepository,
}));

vi.mock('@/lib/database/repositories/valueProps', () => ({
  valuePropRepository: mocks.valuePropRepository,
}));

const queries: [string, () => Promise<unknown>][] = [
  ['getCategoryIdsWithActiveProducts', () => getCategoryIdsWithActiveProducts()],
  ['getAdminCategories', () => getAdminCategories()],
  ['getAdminCategoryById', () => getAdminCategoryById('cat-1')],
  ['getAdminDiscoverTiles', () => getAdminDiscoverTiles()],
  ['getAdminDiscoverTileById', () => getAdminDiscoverTileById('tile-1')],
  ['getFlowerTypes', () => getFlowerTypes()],
  ['getFlowerTypeUsage', () => getFlowerTypeUsage('Rosa')],
  ['getAdminHeroSlides', () => getAdminHeroSlides()],
  ['getAdminHeroSlideById', () => getAdminHeroSlideById('slide-1')],
  ['getProductColors', () => getProductColors()],
  ['getProductColorUsage', () => getProductColorUsage('Rojo')],
  ['getAdminProductCategoryCounts', () => getAdminProductCategoryCounts(['cat-1'])],
  ['getAdminProductList', () => getAdminProductList({ page: 1 })],
  ['getAdminProductById', () => getAdminProductById('prod-1')],
  ['getAdminPromoBanners', () => getAdminPromoBanners()],
  ['getAdminPromoBannerById', () => getAdminPromoBannerById('banner-1')],
  ['getAdminPromoPresetByBannerId', () => getAdminPromoPresetByBannerId('banner-1')],
  ['getAdminTestimonials', () => getAdminTestimonials()],
  ['getAdminTestimonialById', () => getAdminTestimonialById('testimonial-1')],
  ['getAdminValueProps', () => getAdminValueProps()],
  ['getAdminValuePropById', () => getAdminValuePropById('value-prop-1')],
];

const repositorySpies = [
  ...Object.values(mocks.productsRepository),
  ...Object.values(mocks.categoryRepository),
  ...Object.values(mocks.discoverTileRepository),
  ...Object.values(mocks.taxonomyRepository),
  ...Object.values(mocks.heroSlideRepository),
  ...Object.values(mocks.promoBannerRepository),
  mocks.listPromoBannersByPreset,
  ...Object.values(mocks.testimonialRepository),
  ...Object.values(mocks.valuePropRepository),
];

const authFailures = [
  new AuthError('UNAUTHENTICATED', 'No active session'),
  new AuthError('FORBIDDEN', 'Not an admin'),
];

describe('admin queries authorization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  for (const failure of authFailures) {
    describe(`when requireAdmin rejects with ${failure.code}`, () => {
      it.each(queries)('%s rejects without touching the repository', async (_name, run) => {
        mocks.requireAdmin.mockRejectedValue(failure);

        await expect(run()).rejects.toBeInstanceOf(AuthError);
        await expect(run()).rejects.toMatchObject({ code: failure.code });

        expect(mocks.requireAdmin).toHaveBeenCalled();
        for (const spy of repositorySpies) {
          expect(spy).not.toHaveBeenCalled();
        }
      });
    });
  }

  it('passes the repository result through for an admin', async () => {
    const categories = [{ id: 'cat-1', name: 'Rosas' }];
    mocks.requireAdmin.mockResolvedValue({ id: 'admin-1' });
    mocks.categoryRepository.listAll.mockResolvedValue(categories);

    await expect(getAdminCategories()).resolves.toBe(categories);

    expect(mocks.requireAdmin).toHaveBeenCalledTimes(1);
    expect(mocks.categoryRepository.listAll).toHaveBeenCalledTimes(1);
  });
});
