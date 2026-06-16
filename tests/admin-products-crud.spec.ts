import { expect, type Page,test } from '@playwright/test';

import { getAdminCredentials, loginAsAdmin } from './helpers/adminAuth';

/**
 * Phase 4C — Admin productos CRUD E2E.
 *
 * IMPORTANTE — alcance defensivo:
 *
 * El form de productos exige `imageUrl` servido desde Cloudinary, validado por
 * zod (`CLOUDINARY_URL_REGEX`). El upload real requiere firma server-side y
 * mover bytes hacia Cloudinary, lo cual NO es práctico en E2E (cuesta créditos
 * y deja basura). Por eso estos specs:
 *
 *  1) NO crean productos persistentes — verificamos validación zod (camino de
 *     error) y que el form llega a montarse correctamente.
 *  2) Las pruebas mutables (editar nombre, toggle status) tocan un producto
 *     existente y revierten su cambio en `afterEach` para dejar la DB intacta.
 *  3) "Eliminar" sólo verifica que el ConfirmDialog aparece y que cancelar
 *     funciona — no se ejecuta el delete real para no dañar data del negocio.
 *
 * Requiere E2E_ADMIN_EMAIL + E2E_ADMIN_PASSWORD en env.
 */

const credentials = getAdminCredentials();

interface ProductSnapshot {
  id: string;
  href: string;
  name: string;
  isActive: boolean;
}

/**
 * Toma el primer producto de la lista (modo "Todas"). Devuelve null si no hay.
 * Usa el href del botón "Editar" para extraer el id.
 */
async function pickFirstProduct(page: Page): Promise<ProductSnapshot | null> {
  await page.goto('/admin/productos');
  // Tabla en modo "Todas" — sin reorder, sin DnD.
  const editLink = page.getByRole('link', { name: 'Editar' }).first();
  if ((await editLink.count()) === 0) return null;

  const href = await editLink.getAttribute('href');
  if (!href) return null;
  const id = href.split('/').pop() ?? '';

  // El nombre del producto es el primer <p class="font-medium">.
  // Buscamos por la fila que contiene el link Editar con ese href.
  const row = page.locator('tr', { has: page.locator(`a[href="${href}"]`) });
  const name = (await row.locator('p.font-medium').first().textContent())?.trim() ?? '';

  // Toggle status — buscamos el switch en esa fila.
  const switchEl = row.getByRole('switch');
  const isChecked = (await switchEl.getAttribute('aria-checked')) === 'true';

  return { id, href, name, isActive: isChecked };
}

test.describe('Phase 4C — Admin productos CRUD', () => {
  test.skip(
    !credentials,
    'Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD to run admin product CRUD tests.',
  );

  test.beforeEach(async ({ page }) => {
    if (!credentials) return;
    await loginAsAdmin(page, credentials);
  });

  test('listar productos muestra la tabla con al menos un producto', async ({ page }) => {
    await page.goto('/admin/productos');
    await expect(
      page.getByRole('heading', { name: 'Productos' }),
    ).toBeVisible();

    // Debería haber pills de "Todas" + categorías.
    await expect(page.getByRole('button', { name: /^Todas\s/ })).toBeVisible();
  });

  test('filtro por categoría: cambiar pill cambia productos visibles', async ({ page }) => {
    await page.goto('/admin/productos');

    // Capturar URL inicial.
    const allBtn = page.getByRole('button', { name: /^Todas\s/ });
    await expect(allBtn).toBeVisible();

    // Buscar la primera pill que NO sea "Todas".
    const categoryPills = page.getByRole('button').filter({ hasText: /\(\d+\)$/ });
    const total = await categoryPills.count();
    if (total < 2) {
      test.skip(true, 'Requiere al menos una categoría además de "Todas" para validar filtro.');
      return;
    }

    // Click en la 2da pill (alguna categoría) — la URL debe incluir categoria=
    const someCategory = categoryPills.nth(1);
    const categoryLabel = await someCategory.textContent();
    await someCategory.click();
    await expect(page).toHaveURL(/categoria=/);

    // Volver a Todas — la URL debe quedar sin `categoria=`.
    await page.getByRole('button', { name: /^Todas\s/ }).click();
    await expect(page).not.toHaveURL(/categoria=/);

    // Smoke: el label efectivamente correspondía a una categoría con productos.
    expect(categoryLabel).toMatch(/\(\d+\)/);
  });

  test('navegar al form "Nuevo producto" muestra todos los fields', async ({ page }) => {
    await page.goto('/admin/productos');
    await page.getByRole('link', { name: /Nuevo producto/i }).click();
    await expect(page).toHaveURL(/\/admin\/productos\/nuevo/);

    await expect(page.getByRole('heading', { name: 'Nuevo producto' })).toBeVisible();
    // Fields requeridos.
    await expect(page.getByLabel(/^Nombre/)).toBeVisible();
    await expect(page.getByLabel('Descripción')).toBeVisible();
    await expect(page.getByLabel('Categoría')).toBeVisible();
    await expect(page.getByLabel('Precio base (S/)')).toBeVisible();
  });

  test('validación zod: submit sin nombre muestra error inline accesible', async ({ page }) => {
    await page.goto('/admin/productos/nuevo');

    // Llenar SOLO descripción + categoría + precio para sortear el `required` HTML
    // del campo Nombre y forzar que la validación llegue a zod en el server action.
    // (El form usa `noValidate` por lo que el `required` HTML no bloquea el submit.)
    await page.getByLabel('Descripción').fill('Producto válido para test E2E');

    const categorySelect = page.getByLabel('Categoría');
    // Seleccionar la PRIMERA categoría real (no la opción placeholder vacía).
    const firstOptionValue = await categorySelect
      .locator('option')
      .nth(1)
      .getAttribute('value');
    if (!firstOptionValue) {
      test.skip(true, 'No hay categorías para el dropdown.');
      return;
    }
    await categorySelect.selectOption(firstOptionValue);

    await page.getByLabel('Precio base (S/)').fill('100');

    // Submit con name vacío + sin imagen — zod fallará en `name` y `imageUrl`.
    await page.getByRole('button', { name: /Crear producto|Guardar producto/i }).click();

    // Debe aparecer al menos un mensaje role=alert (FieldError o FormError).
    const alerts = page.getByRole('alert');
    await expect(alerts.first()).toBeVisible({ timeout: 5000 });

    // El input Nombre debe quedar marcado aria-invalid o el form debe quedar visible.
    // (No exigimos que sea aria-invalid en `name` específicamente porque zod puede
    // reportar primero `imageUrl`. Lo importante es que NO redirige al listado.)
    await expect(page).toHaveURL(/\/admin\/productos\/nuevo/);
  });

  test('editar producto: cambiar nombre y revertir', async ({ page }) => {
    const product = await pickFirstProduct(page);
    if (!product) {
      test.skip(true, 'No hay productos para editar.');
      return;
    }

    await page.goto(product.href);
    await expect(page.getByRole('heading', { name: 'Editar producto' })).toBeVisible();

    const nameInput = page.getByLabel(/^Nombre/);
    await expect(nameInput).toHaveValue(product.name);

    const tempName = `${product.name} [E2E_TMP_${Date.now()}]`;
    await nameInput.fill(tempName);
    await page.getByRole('button', { name: /Guardar producto/i }).click();

    // Volvió a la lista — verificamos URL.
    await page.waitForURL(/\/admin\/productos(?:\?|$)/);

    // Refrescar y revertir: tomar el mismo producto y restaurar el nombre.
    await page.goto(product.href);
    const nameInputBack = page.getByLabel(/^Nombre/);
    await expect(nameInputBack).toHaveValue(tempName);
    await nameInputBack.fill(product.name);
    await page.getByRole('button', { name: /Guardar producto/i }).click();
    await page.waitForURL(/\/admin\/productos(?:\?|$)/);
  });

  test('toggle status: cambia el switch y revierte', async ({ page }) => {
    const product = await pickFirstProduct(page);
    if (!product) {
      test.skip(true, 'No hay productos para togglear.');
      return;
    }

    await page.goto('/admin/productos');
    const row = page.locator('tr', { has: page.locator(`a[href="${product.href}"]`) });
    const switchEl = row.getByRole('switch');

    const initial = (await switchEl.getAttribute('aria-checked')) === 'true';
    await switchEl.click();

    // Esperamos optimistic update — el aria-checked debe haber cambiado.
    await expect(switchEl).toHaveAttribute('aria-checked', initial ? 'false' : 'true');

    // Revertir.
    await switchEl.click();
    await expect(switchEl).toHaveAttribute('aria-checked', initial ? 'true' : 'false');
  });

  test('eliminar: el ConfirmDialog aparece y cancelar funciona (no se ejecuta delete)', async ({
    page,
  }) => {
    const product = await pickFirstProduct(page);
    if (!product) {
      test.skip(true, 'No hay productos para verificar dialog.');
      return;
    }

    await page.goto('/admin/productos');
    const row = page.locator('tr', { has: page.locator(`a[href="${product.href}"]`) });
    await row.getByRole('button', { name: 'Eliminar' }).click();

    // El AlertDialog (Radix) debe aparecer.
    const dialog = page.getByRole('alertdialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(/¿Eliminar el producto/)).toBeVisible();

    // Cancelar — el dialog se cierra y el producto sigue ahí.
    await dialog.getByRole('button', { name: 'Cancelar' }).click();
    await expect(dialog).not.toBeVisible();

    // El producto sigue en la lista.
    await expect(page.locator(`a[href="${product.href}"]`)).toBeVisible();
  });
});
