import { expect,test } from '@playwright/test';

test('catalog search syncs query params and can clear filters', async ({ page }) => {
  await page.goto('/catalogo');

  const searchInput = page.getByPlaceholder('Buscar ramos, flores...');
  await searchInput.fill('girasoles');

  await expect(page).toHaveURL(/\/catalogo\?q=girasoles/);
  await expect(page.getByRole('button', { name: 'Limpiar filtros' })).toBeVisible();

  await page.getByRole('button', { name: 'Limpiar filtros' }).click();

  await expect(page).toHaveURL(/\/catalogo$/);
  await expect(searchInput).toHaveValue('');
});

test('catalog hydrates filters from URL params on first load', async ({ page }) => {
  await page.goto('/catalogo?q=girasoles');

  const searchInput = page.getByPlaceholder('Buscar ramos, flores...');

  await expect(searchInput).toHaveValue('girasoles');
  await expect(page.getByRole('button', { name: 'Limpiar filtros' })).toBeVisible();
});
