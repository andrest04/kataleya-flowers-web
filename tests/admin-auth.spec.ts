import { expect,test } from '@playwright/test';

import { getAdminCredentials, loginAsAdmin } from './helpers/adminAuth';

/**
 * Phase 4C — Admin auth E2E.
 *
 * Cubre:
 *  - Login exitoso (renderiza dashboard, sidebar visible)
 *  - Logout (vuelve a /login y la sesión queda invalidada)
 *  - Acceso sin sesión a /admin/* redirige a /login (proxy.ts)
 *  - Acceso sin sesión a /api/cloudinary/sign devuelve 401
 *
 * Requiere E2E_ADMIN_EMAIL + E2E_ADMIN_PASSWORD en env.
 */

const credentials = getAdminCredentials();

// Tests que NO requieren credenciales — corren siempre.
test.describe('Phase 4C — Admin auth (sin sesión)', () => {
  test('acceso sin sesión a /admin/productos redirige a /login', async ({ browser }) => {
    // Context limpio (sin cookies de auth).
    const ctx = await browser.newContext();
    const page = await ctx.newPage();

    await page.goto('/admin/productos');
    await page.waitForURL(/\/login/);
    await expect(page).toHaveURL(/\/login/);

    await ctx.close();
  });

  test('acceso sin sesión a /api/cloudinary/sign devuelve 401', async ({ browser }) => {
    // Request context independiente — sin cookies.
    const ctx = await browser.newContext();
    const response = await ctx.request.post('/api/cloudinary/sign', {
      data: { folder: 'productos' },
      headers: { 'content-type': 'application/json' },
    });

    // Phase 2 endurece el endpoint con auth obligatoria.
    expect([401, 403]).toContain(response.status());

    await ctx.close();
  });
});

// Tests que SÍ requieren credenciales — se skipean si no están seteadas.
test.describe('Phase 4C — Admin auth (con sesión)', () => {
  test.skip(
    !credentials,
    'Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD to run authenticated admin auth tests.',
  );

  test('login exitoso lleva a /admin con sidebar visible', async ({ page }) => {
    if (!credentials) return;

    await loginAsAdmin(page, credentials);

    // Sidebar admin debe estar visible — renderiza link a Productos y Categorías
    const sidebar = page.getByRole('navigation').first();
    await expect(sidebar.getByRole('link', { name: 'Productos' })).toBeVisible();
    await expect(sidebar.getByRole('link', { name: 'Categorías' })).toBeVisible();
  });

  test('logout invalida sesión y /admin redirige a /login', async ({ page }) => {
    if (!credentials) return;

    await loginAsAdmin(page, credentials);

    // Click en LogoutButton — match flexible (carga "Cerrar sesión" o "Cerrando…")
    await page.getByRole('button', { name: /cerrar sesión/i }).click();

    // Después del logout, ir a /admin/productos debe redirigir a /login
    await page.goto('/admin/productos');
    await page.waitForURL(/\/login/);
    await expect(page).toHaveURL(/\/login/);
  });
});
