import { expect,test } from '@playwright/test';

test('landing page loads with hero section', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('#hero h1')).toBeVisible();
  await expect(page.locator('#hero')).toBeVisible();
});

test('catalog page shows categories', async ({ page }) => {
  await page.goto('/catalogo');

  await expect(
    page.getByRole('heading', { name: /catálogo/i }),
  ).toBeVisible();

  const categoryLinks = page.locator('a[href^="/catalogo/"]');
  await expect(categoryLinks.first()).toBeVisible();
});

test('admin redirects to login when unauthenticated', async ({ page }) => {
  await page.goto('/admin');

  await page.waitForURL('**/login**');
  await expect(page).toHaveURL(/\/login/);
});

test('category page shows product grid', async ({ page }) => {
  await page.goto('/catalogo');

  const firstCategoryLink = page.locator('a[href^="/catalogo/"]').first();
  await firstCategoryLink.click();

  await expect(page.locator('[data-testid="product-grid"], main')).toBeVisible();
});
