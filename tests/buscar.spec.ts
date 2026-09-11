import { expect, test } from '@playwright/test';

test.describe('/buscar', () => {
  test('empty search shows the store search heading, field, and discovery sections', async ({
    page,
  }) => {
    await page.goto('/buscar');

    await expect(
      page.getByRole('heading', { level: 1, name: 'Busca en la tienda' }),
    ).toBeVisible();
    await expect(page.getByLabel('Buscar productos')).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Búsquedas frecuentes' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'También te puede gustar' }),
    ).toBeVisible();
  });

  test('submitting the store search form lands on /buscar?q=', async ({ page }) => {
    await page.goto('/buscar');

    const field = page.getByLabel('Buscar productos');
    await field.fill('rosas');
    await field.press('Enter');

    await expect(page).toHaveURL(/\/buscar\?q=rosas/);
  });

  test('Navbar search submit (desktop) goes to /buscar?q= not /catalogo?q=', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    await page.getByRole('button', { name: 'Buscar' }).filter({ visible: true }).click();
    const overlayField = page.getByRole('combobox', { name: 'Buscar productos' });
    await expect(overlayField).toBeVisible();
    await overlayField.fill('rosas');
    await overlayField.press('Enter');

    await expect(page).toHaveURL(/\/buscar\?q=rosas/);
    await expect(page).not.toHaveURL(/\/catalogo\?q=/);
  });

  test('unlikely query shows empty recovery and hides discovery sections', async ({
    page,
  }) => {
    await page.goto('/buscar?q=zzzunlikely');

    await expect(
      page.getByText('No encontramos resultados para “zzzunlikely”'),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: 'Limpiar búsqueda' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Ver catálogo' })).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Búsquedas frecuentes' }),
    ).toHaveCount(0);
    await expect(
      page.getByRole('heading', { name: 'También te puede gustar' }),
    ).toHaveCount(0);
  });
});
