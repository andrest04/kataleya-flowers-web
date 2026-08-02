import { expect, test } from '@playwright/test';

const openFilters = async (page: import('@playwright/test').Page) => {
  const trigger = page.getByRole('button', { name: 'Filtrar y ordenar' });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Filtrar y ordenar' });
  await expect(dialog).toBeVisible();
  return { trigger, dialog };
};

const expandSection = async (page: import('@playwright/test').Page, title: string) => {
  const summary = page.getByRole('dialog').locator('summary', { hasText: title });
  if ((await summary.count()) === 0) return;
  const details = summary.locator('..');
  if (!(await details.getAttribute('open'))) await summary.click();
};

test('filter Sheet supports Escape, focus restore, and the real price ceiling', async ({ page }) => {
  await page.goto('/catalogo');
  const { trigger, dialog } = await openFilters(page);
  const maximumPrice = page.getByLabel('Hasta');

  await expect(maximumPrice).toHaveAttribute('min', '0');
  const max = Number(await maximumPrice.getAttribute('max'));
  expect(max).toBeGreaterThan(0);
  await expect(maximumPrice).toHaveValue(String(max));

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('category selection applies instantly, hydrates from URL, and clear preserves sorting', async ({ page }) => {
  await page.goto('/catalogo?orden=name-asc&campaign=summer');
  const { dialog } = await openFilters(page);
  await expandSection(page, 'Categoría');
  const productCategorySlugs = await page
    .locator('section[aria-label="Productos"] a[href^="/catalogo/"]')
    .evaluateAll((links) =>
      links.map((link) => new URL((link as HTMLAnchorElement).href).pathname.split('/')[2]),
    );
  const filterCategoryValues = await page
    .locator('input[name="categoria"]:not([value=""])')
    .evaluateAll((inputs) => inputs.map((input) => (input as HTMLInputElement).value));
  expect(
    filterCategoryValues.every((value) => productCategorySlugs.includes(value)),
    JSON.stringify({ filterCategoryValues, productCategorySlugs }),
  ).toBe(true);
  const category = page.getByRole('radio').nth(1);
  const categoryValue = await category.getAttribute('value');
  expect(categoryValue).toBeTruthy();
  await category.check();

  await expect(page).toHaveURL(new RegExp(`categoria=${categoryValue}`));
  await expect(page).toHaveURL(/orden=name-asc/);
  await expect(page).toHaveURL(/campaign=summer/);

  await page.reload();
  await openFilters(page);
  await expandSection(page, 'Categoría');
  await expect(page.getByRole('radio', { checked: true })).toHaveValue(categoryValue ?? '');
  await dialog.getByRole('button', { name: 'Limpiar filtros' }).click();
  await expect(page).not.toHaveURL(/categoria=/);
  await expect(page).toHaveURL(/orden=name-asc/);
  await expect(page).toHaveURL(/campaign=summer/);
});

test('assigned color and flower facets combine and hydrate without fabricating unavailable data', async ({ page }) => {
  await page.goto('/catalogo');
  await openFilters(page);
  await expandSection(page, 'Color');
  await expandSection(page, 'Tipo de flor');
  const color = page.locator('input[name="color"]').first();
  const flowerType = page.locator('input[name="tipo"]').first();
  const hasColor = await color.count();
  const hasFlowerType = await flowerType.count();

  if (!hasColor && !hasFlowerType) {
    await expect(page.getByText('No hay opciones disponibles')).toBeVisible();
    return;
  }

  const colorValue = hasColor ? await color.getAttribute('value') : null;
  const typeValue = hasFlowerType ? await flowerType.getAttribute('value') : null;
  if (hasColor) await color.check();
  if (hasFlowerType) await flowerType.check();

  if (colorValue) await expect(page).toHaveURL(new RegExp(`color=${encodeURIComponent(colorValue)}`));
  if (typeValue) await expect(page).toHaveURL(new RegExp(`tipo=${encodeURIComponent(typeValue)}`));

  await page.reload();
  await openFilters(page);
  if (colorValue) await expect(page.locator(`input[name="color"][value="${colorValue}"]`)).toBeChecked();
  if (typeValue) await expect(page.locator(`input[name="tipo"][value="${typeValue}"]`)).toBeChecked();
});

test('empty filtered results offer clear recovery without removing sorting', async ({ page }) => {
  await page.goto('/catalogo?orden=price-desc');
  const { dialog } = await openFilters(page);
  const minimumPrice = page.getByLabel('Desde');
  const maximumPrice = page.getByLabel('Hasta');
  const maximum = await maximumPrice.getAttribute('max');
  await minimumPrice.fill(maximum ?? '1');
  await maximumPrice.fill('0');

  await expect(page.getByText('No encontramos productos con esos filtros.')).toBeVisible();
  await dialog.getByRole('button', { name: 'Limpiar filtros' }).click();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(page).not.toHaveURL(/precio_min|precio_max/);
  await expect(page).toHaveURL(/orden=price-desc/);
  await expect(page.getByRole('region', { name: 'Productos' }).locator('article').first()).toBeVisible();
});
