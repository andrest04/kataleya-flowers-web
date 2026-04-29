import { expect,test } from '@playwright/test';

import { getAdminCredentials, loginAsAdmin } from './helpers/adminAuth';

const credentials = getAdminCredentials();

test.describe('authenticated admin dashboard', () => {
  test.skip(
    !credentials,
    'Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD to run authenticated admin dashboard tests.',
  );

  test.beforeEach(async ({ page }) => {
    if (!credentials) {
      return;
    }

    await loginAsAdmin(page, credentials);
  });

  test('analytics tab deep links preserve tab and range in URL', async ({ page }) => {
    await page.goto('/admin?tab=analiticas&range=90');

    await expect(page.getByRole('button', { name: 'Analíticas' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(page).toHaveURL(/tab=analiticas/);
    await expect(page).toHaveURL(/range=90/);
    await expect(page.getByText(/Rango activo:\s*últimos 90 días\./i)).toBeVisible();

    await page.getByRole('button', { name: '30 días' }).click();

    await expect(page).toHaveURL(/tab=analiticas/);
    await expect(page).toHaveURL(/range=30/);
    await expect(page.getByText(/Rango activo:\s*últimos 30 días\./i)).toBeVisible();

    await page.getByRole('button', { name: 'Resumen' }).click();

    await expect(page).toHaveURL(/tab=resumen/);
    await expect(page).toHaveURL(/range=30/);
    await expect(page.getByRole('button', { name: 'Resumen' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
});
