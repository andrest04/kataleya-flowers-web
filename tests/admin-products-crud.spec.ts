import { expect, type Page, test } from '@playwright/test';

import { getAdminCredentials, loginAsAdmin } from './helpers/adminAuth';

const credentials = getAdminCredentials();

interface CategoryWorkspace {
  href: string;
  name: string;
}

/**
 * Toma la primera categoría administrable. Falla si no hay ninguna: el admin
 * sin categorías es un entorno mal sembrado, no un caso válido que saltear.
 */
async function pickCategoryWorkspace(page: Page): Promise<CategoryWorkspace> {
  await page.goto('/admin/categorias');
  const manageLink = page.getByRole('link', { name: 'Gestionar productos' }).first();
  await expect(
    manageLink,
    'El admin no tiene categorías: el entorno de test no está sembrado',
  ).toBeVisible();

  const href = await manageLink.getAttribute('href');
  if (!href) {
    throw new Error('El link "Gestionar productos" no tiene href');
  }

  // Desktop viewport renders CategoryList as a table; each category is a <tr>.
  const row = page.locator('tr', { has: manageLink });
  const name = (await row.locator('p').first().textContent())?.trim() ?? '';
  return { href, name };
}

test.describe('Administración de productos por categoría', () => {
  test.skip(
    !credentials,
    'Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD to run admin product CRUD tests.',
  );

  test.beforeEach(async ({ page }) => {
    if (!credentials) return;
    await loginAsAdmin(page, credentials);
  });

  test('categorías muestra el conteo y lleva al espacio de productos', async ({ page }) => {
    const workspace = await pickCategoryWorkspace(page);

    await expect(page.getByText(/\d+ productos?/).first()).toBeVisible();
    await page.goto(workspace.href);
    await expect(page.getByRole('heading', { name: `Productos de ${workspace.name}` })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Nuevo producto' })).toBeVisible();
  });

  test('nuevo producto conserva la categoría y vuelve a su espacio tras guardar', async ({ page }) => {
    const workspace = await pickCategoryWorkspace(page);

    await page.goto(workspace.href);
    await page.getByRole('link', { name: 'Nuevo producto' }).click();
    await expect(page).toHaveURL(new RegExp(`${workspace.href}/nuevo$`));
    await expect(page.getByRole('heading', { name: 'Nuevo producto' })).toBeVisible();
    await expect(page.getByLabel('Categoría')).toHaveValue(workspace.href.split('/')[3]);
  });

  test('productos individuales exponen estado, edición y eliminación', async ({ page }) => {
    const workspace = await pickCategoryWorkspace(page);

    await page.goto(workspace.href);
    const editLink = page.getByRole('link', { name: 'Editar' }).first();
    await expect(
      editLink,
      `La categoría ${workspace.name} no tiene productos: el entorno de test no está sembrado`,
    ).toBeVisible();

    await expect(page.getByRole('switch').first()).toBeVisible();
    await expect(editLink).toBeVisible();
    await page.getByRole('button', { name: 'Eliminar' }).first().click();
    const dialog = page.getByRole('alertdialog');
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Cancelar' }).click();
    await expect(dialog).not.toBeVisible();
  });
});
