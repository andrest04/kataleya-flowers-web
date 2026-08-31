import { expect, type Page } from '@playwright/test';

export interface AdminCredentials {
  email: string;
  password: string;
}

export function getAdminCredentials(): AdminCredentials | null {
  const email = process.env.E2E_ADMIN_EMAIL;
  const password = process.env.E2E_ADMIN_PASSWORD;

  if (!email || !password) {
    // Saltarse los specs de admin es aceptable en local, pero en CI sería un
    // falso verde: preferimos que la pipeline falle ruidosamente.
    if (process.env.CI) {
      throw new Error(
        "E2E_ADMIN_EMAIL y E2E_ADMIN_PASSWORD son obligatorias en CI: sin ellas los specs de admin se saltan y la corrida pasa sin haber probado nada.",
      );
    }
    return null;
  }

  return { email, password };
}

export async function loginAsAdmin(page: Page, credentials: AdminCredentials): Promise<void> {
  await page.goto('/login');

  await page.getByLabel('Email').fill(credentials.email);
  await page.getByLabel('Contraseña').fill(credentials.password);
  await page.getByRole('button', { name: 'Ingresar' }).click();

  // Login lands on the /admin dashboard (see src/app/(auth)/login/page.tsx).
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
}
