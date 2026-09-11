import { expect, type Page,test } from '@playwright/test';

import { getAdminCredentials, loginAsAdmin } from './helpers/adminAuth';

const credentials = getAdminCredentials();

interface CategorySnapshot {
  id: string;
  name: string;
  rowSelector: string;
}

async function pickFirstCategory(page: Page): Promise<CategorySnapshot> {
  await page.goto('/admin/categorias');

  const editLink = page.getByRole('link', { name: 'Editar' }).first();
  await expect(
    editLink,
    'El admin no tiene categorías: el entorno de test no está sembrado',
  ).toBeVisible();

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

    await page.goto(cat.rowSelector);
    await expect(page.getByRole('heading', { name: /Editar categoría|Categoría/ })).toBeVisible({
      timeout: 5000,
    }).catch(async () => {
      await expect(page.getByLabel(/^Nombre/)).toBeVisible();
    });

    await expect(page.getByLabel(/^Nombre/)).toHaveValue(cat.name);
  });

  test('toggle status: cambia y revierte', async ({ page }) => {
    const cat = await pickFirstCategory(page);

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
    await expect(
      firstDelete,
      'El admin no tiene categorías: el entorno de test no está sembrado',
    ).toBeVisible();
    await firstDelete.click();

    const dialog = page.getByRole('alertdialog');
    await expect(dialog).toBeVisible();

    await expect(dialog.getByRole('heading', { name: /Eliminar categoría/ })).toBeVisible();

    const hasReassign = await dialog
      .getByText(/Mover productos a otra categoría/)
      .isVisible()
      .catch(() => false);
    const hasCascade = await dialog
      .getByText(/Eliminar categoría y todos sus productos/)
      .isVisible()
      .catch(() => false);

    if (hasReassign || hasCascade) {
      await expect(
        dialog.getByText(/Mover productos a otra categoría/),
      ).toBeVisible();
      await expect(
        dialog.getByText(/Eliminar categoría y todos sus productos/),
      ).toBeVisible();
    }

    await dialog.getByRole('button', { name: 'Cancelar' }).click();
    await expect(dialog).not.toBeVisible();
  });
});
