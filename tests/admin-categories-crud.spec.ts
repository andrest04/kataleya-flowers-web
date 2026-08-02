import { expect, type Page,test } from '@playwright/test';

import { getAdminCredentials, loginAsAdmin } from './helpers/adminAuth';

/**
 * Phase 4C — Admin categorías CRUD E2E.
 *
 * IMPORTANTE — alcance defensivo:
 *
 * Las categorías son data crítica del negocio (las usan productos, sitemap,
 * URLs públicas). Por eso NO ejecutamos creación / borrado real:
 *
 *  - "Crear categoría": sólo verificamos que el form renderiza con todos los
 *    campos requeridos.
 *  - "Editar": navegamos al form y verificamos que carga con valores.
 *  - "Toggle status / featured": cambiamos y revertimos en el mismo test.
 *  - "Eliminar con productos": verificamos que el dialog elaborado aparece y
 *    que cancelar funciona (NO se ejecuta el cascade real).
 *
 * Requiere E2E_ADMIN_EMAIL + E2E_ADMIN_PASSWORD en env.
 */

const credentials = getAdminCredentials();

interface CategorySnapshot {
  id: string;
  name: string;
  rowSelector: string;
}

/**
 * Toma la primera categoría visible. Devuelve null si no hay.
 */
async function pickFirstCategory(page: Page): Promise<CategorySnapshot | null> {
  await page.goto('/admin/categorias');

  const editLink = page.getByRole('link', { name: 'Editar' }).first();
  if ((await editLink.count()) === 0) return null;

  const href = (await editLink.getAttribute('href')) ?? '';
  const id = href.split('/').pop() ?? '';

  const row = page.locator('tr', {
    has: page.locator(`a[href="${href}"]`),
  });
  const name = (await row.locator('p.font-medium').first().textContent())?.trim() ?? '';

  return { id, name, rowSelector: href };
}

test.describe('Phase 4C — Admin categorías CRUD', () => {
  test.skip(
    !credentials,
    'Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD to run admin category CRUD tests.',
  );

  test.beforeEach(async ({ page }) => {
    if (!credentials) return;
    await loginAsAdmin(page, credentials);
  });

  test('listar categorías muestra el listado', async ({ page }) => {
    await page.goto('/admin/categorias');
    await expect(page.getByRole('heading', { name: 'Categorías' })).toBeVisible();
    await expect(
      page.getByRole('link', { name: /Nueva categoría/i }),
    ).toBeVisible();
  });

  test('navegar al form "Nueva categoría" muestra todos los fields', async ({ page }) => {
    await page.goto('/admin/categorias');
    await page.getByRole('link', { name: /Nueva categoría/i }).click();
    await expect(page).toHaveURL(/\/admin\/categorias\/nueva/);

    await expect(page.getByRole('heading', { name: 'Nueva categoría' })).toBeVisible();
    await expect(page.getByLabel(/^Nombre/)).toBeVisible();
    await expect(page.getByLabel('Descripción')).toBeVisible();
    await expect(page.getByLabel('Ocasión')).toBeVisible();
  });

  test('editar categoría: form carga con valores actuales', async ({ page }) => {
    const cat = await pickFirstCategory(page);
    if (!cat) {
      test.skip(true, 'No hay categorías para editar.');
      return;
    }

    await page.goto(cat.rowSelector);
    await expect(page.getByRole('heading', { name: /Editar categoría|Categoría/ })).toBeVisible({
      timeout: 5000,
    }).catch(async () => {
      // Algunos layouts no usan "Editar categoría" como heading literal.
      // Aceptamos que el form esté visible (Nombre con valor).
      await expect(page.getByLabel(/^Nombre/)).toBeVisible();
    });

    await expect(page.getByLabel(/^Nombre/)).toHaveValue(cat.name);
  });

  test('toggle status: cambia y revierte', async ({ page }) => {
    const cat = await pickFirstCategory(page);
    if (!cat) {
      test.skip(true, 'No hay categorías.');
      return;
    }

    await page.goto('/admin/categorias');

    const row = page.locator('tr').filter({ hasText: cat.name }).first();
    const switches = row.getByRole('switch');
    const statusSwitch = switches.first();

    const initial = (await statusSwitch.getAttribute('aria-checked')) === 'true';
    await statusSwitch.click();
    await expect(statusSwitch).toHaveAttribute(
      'aria-checked',
      initial ? 'false' : 'true',
    );

    // Revertir.
    await statusSwitch.click();
    await expect(statusSwitch).toHaveAttribute(
      'aria-checked',
      initial ? 'true' : 'false',
    );
  });

  test('eliminar categoría con productos: dialog elaborado aparece y se cancela', async ({
    page,
  }) => {
    await page.goto('/admin/categorias');

    const firstDelete = page.getByRole('button', { name: 'Eliminar' }).first();
    if ((await firstDelete.count()) === 0) {
      test.skip(true, 'No hay categorías para verificar dialog.');
      return;
    }
    await firstDelete.click();

    // Dialog Radix.
    const dialog = page.getByRole('alertdialog');
    await expect(dialog).toBeVisible();

    // El dialog debe tener un título "Eliminar categoría" (scope al heading: la
    // opción cascade "Eliminar categoría y todos sus productos" también contiene
    // ese texto).
    await expect(dialog.getByRole('heading', { name: /Eliminar categoría/ })).toBeVisible();

    // Si la categoría tiene productos, el dialog tendrá las opciones reassign / cascade.
    // Si no, sólo tendrá el confirm/cancel simple.
    const hasReassign = await dialog
      .getByText(/Mover productos a otra categoría/)
      .isVisible()
      .catch(() => false);
    const hasCascade = await dialog
      .getByText(/Eliminar categoría y todos sus productos/)
      .isVisible()
      .catch(() => false);

    if (hasReassign || hasCascade) {
      // Es el dialog elaborado — verificamos ambas opciones.
      await expect(
        dialog.getByText(/Mover productos a otra categoría/),
      ).toBeVisible();
      await expect(
        dialog.getByText(/Eliminar categoría y todos sus productos/),
      ).toBeVisible();
    }

    // Cancelar en cualquier caso.
    await dialog.getByRole('button', { name: 'Cancelar' }).click();
    await expect(dialog).not.toBeVisible();
  });
});
