import { expect, test } from "@playwright/test";

/**
 * Libro de Reclamaciones (INDECOPI) — formulario público.
 *
 * NOTA: no se prueba el envío exitoso end-to-end porque escribiría en la DB
 * real y dispararía correos vía Resend. Se cubre render, navegación, selección
 * de tipo y validación (que falla ANTES de tocar la DB).
 */
test.describe("Libro de Reclamaciones — público", () => {
  test("link del footer navega a la página legal", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /libro de reclamaciones/i }).click();
    await expect(page).toHaveURL(/\/libro-de-reclamaciones$/);
    await expect(
      page.getByRole("heading", { name: "Libro de Reclamaciones", level: 1 }),
    ).toBeVisible();
  });

  test("muestra los datos legales del proveedor", async ({ page }) => {
    await page.goto("/libro-de-reclamaciones");
    await expect(page.getByText(/RUC\s+10104853370/)).toBeVisible();
  });

  test("selección de tipo RECLAMO / QUEJA con aria-checked", async ({ page }) => {
    await page.goto("/libro-de-reclamaciones");
    const reclamo = page.getByRole("radio", { name: /reclamo/i });
    const queja = page.getByRole("radio", { name: /queja/i });

    await expect(reclamo).toHaveAttribute("aria-checked", "true");
    await queja.click();
    await expect(queja).toHaveAttribute("aria-checked", "true");
    await expect(reclamo).toHaveAttribute("aria-checked", "false");
  });

  test("enviar vacío muestra errores de validación y no confirma", async ({
    page,
  }) => {
    await page.goto("/libro-de-reclamaciones");
    await page.getByRole("button", { name: /enviar reclamación/i }).click();

    // La validación falla server-side antes de tocar la DB → aparecen alerts.
    await expect(page.getByRole("alert").first()).toBeVisible();
    // No debe mostrarse el estado de éxito.
    await expect(
      page.getByText(/tu reclamación fue registrada/i),
    ).toHaveCount(0);
  });
});
