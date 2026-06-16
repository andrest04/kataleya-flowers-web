import { expect, type Page } from '@playwright/test';

export interface AdminCredentials {
  email: string;
  password: string;
}

export function getAdminCredentials(): AdminCredentials | null {
  const email = process.env.E2E_ADMIN_EMAIL;
  const password = process.env.E2E_ADMIN_PASSWORD;

  if (!email || !password) {
    return null;
  }

  return { email, password };
}

export async function loginAsAdmin(page: Page, credentials: AdminCredentials): Promise<void> {
  await page.goto('/login');

  await page.getByLabel('Email').fill(credentials.email);
  await page.getByLabel('Contraseña').fill(credentials.password);
  await page.getByRole('button', { name: 'Ingresar' }).click();

  // /admin has no dashboard of its own — it redirects to /admin/productos.
  await expect(page).toHaveURL(/\/admin\/productos/);
  await expect(page.getByRole('heading', { name: 'Productos' })).toBeVisible();
}
