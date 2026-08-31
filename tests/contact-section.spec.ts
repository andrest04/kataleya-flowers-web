import { expect, test } from '@playwright/test';

test.describe('Sección de contacto', () => {
  test('la landing expone el ancla #contacto que enlazan navbar, footer y value props', async ({ page }) => {
    await page.goto('/');

    const section = page.locator('#contacto');
    await expect(section).toHaveCount(1);
    await expect(section).toBeVisible();
  });

  test('muestra dirección, horario y el mapa de la tienda', async ({ page }) => {
    await page.goto('/');
    const section = page.locator('#contacto');

    await expect(section.getByText(/Teodosio Parre/i)).toBeVisible();
    await expect(section.getByText(/Lunes a S[áa]bado/i)).toBeVisible();

    const map = section.locator('iframe');
    await expect(map).toHaveCount(1);
    await expect(map).toHaveAttribute('src', /google\.com\/maps\/embed/);
    await expect(map).toHaveAttribute('title', /.+/);
  });

  // Los anchor links de la app hacen scroll suave sin actualizar el hash
  // (ver FooterAnchorLink + useAnchorNavigation), así que lo verificable es
  // que la sección quede a la vista, no que cambie la URL.
  test('el link Contacto del footer desplaza hasta la sección', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#contacto')).not.toBeInViewport();

    await page.locator('footer').getByRole('link', { name: 'Contacto' }).click();
    await expect(page.locator('#contacto')).toBeInViewport({ timeout: 10_000 });
  });

  test('el CTA de WhatsApp apunta a wa.me con el mensaje por defecto', async ({ page }) => {
    await page.goto('/');

    const cta = page.locator('#contacto').getByRole('link', { name: /pedir por whatsapp/i });
    await expect(cta).toHaveAttribute('href', /wa\.me\/\d+\?text=/);
  });
});
