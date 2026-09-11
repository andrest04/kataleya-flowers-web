import { expect,test } from '@playwright/test';

import { getAdminCredentials, loginAsAdmin } from './helpers/adminAuth';

const credentials = getAdminCredentials();

test.describe('Phase 4C — Admin auth (sin sesión)', () => {
  test('acceso sin sesión a /admin/productos redirige a /login', async ({ browser }) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();

    await page.goto('/admin/productos');
    await page.waitForURL(/\/login/);
    await expect(page).toHaveURL(/\/login/);

    await ctx.close();
  });

  test('acceso sin sesión a /api/images/upload devuelve 401', async ({ browser }) => {
    const ctx = await browser.newContext();
    const response = await ctx.request.post('/api/images/upload', {
      multipart: { folder: 'productos' },
    });

    expect([401, 403]).toContain(response.status());

    await ctx.close();
  });
});

test.describe('Phase 4C — Admin auth (con sesión)', () => {
  test.skip(
    !credentials,
    'Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD to run authenticated admin auth tests.',
  );

  test('login exitoso lleva a /admin con sidebar visible', async ({ page }) => {
    if (!credentials) return;

    await loginAsAdmin(page, credentials);

    const sidebar = page.getByRole('navigation').first();
    await expect(sidebar.getByRole('link', { name: 'Productos' })).toBeVisible();
    await expect(sidebar.getByRole('link', { name: 'Categorías' })).toBeVisible();
  });

  test('logout invalida sesión y /admin redirige a /login', async ({ page }) => {
    if (!credentials) return;

    await loginAsAdmin(page, credentials);

    await page.getByRole('button', { name: /cerrar sesión/i }).click();

    await page.waitForURL(/\/login/);

    await page.goto('/admin/productos');
    await page.waitForURL(/\/login/);
    await expect(page).toHaveURL(/\/login/);
  });
});
