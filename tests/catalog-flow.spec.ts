import { expect,test } from "@playwright/test";

const SCREENSHOT_DIR = "QA/screenshots/phase4";

test.describe("Phase 4B — Catalog flow", () => {
  test("catálogo muestra primero productos sin sidebar y conserva rutas válidas", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("/catalogo");

    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByRole("navigation", { name: "Categorías del catálogo" })).toBeVisible();
    await expect(page.getByRole("region", { name: "Opciones del catálogo" })).toBeVisible();
    await expect(page.getByRole("region", { name: "Productos" })).toBeVisible();
    await expect(page.locator("aside")).toHaveCount(0);

    const productLinks = page
      .getByRole("region", { name: "Productos" })
      .locator('a[href^="/catalogo/"]');
    await expect(productLinks.first()).toBeVisible();

    const hrefs = await productLinks.evaluateAll((links) =>
      links.map((link) => (link as HTMLAnchorElement).getAttribute("href") ?? ""),
    );
    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) {
      expect(href).toMatch(/^\/catalogo\/[a-z0-9-]+\/[a-z0-9-]+$/);
    }

    await page.screenshot({
      path: `${SCREENSHOT_DIR}/catalogo-grid.png`,
      fullPage: true,
    });
  });

  test("filtro de precio: editar 'Hasta' en el sheet sincroniza ?precio_max=", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("/catalogo");

    await page.getByRole("button", { name: "Filtrar y ordenar" }).first().click();

    const dialog = page.getByRole("dialog", { name: "Filtrar y ordenar" });
    await expect(dialog).toBeVisible();

    const maxInput = dialog.getByLabel(/hasta/i);
    await expect(maxInput).toBeVisible();

    const initialMax = Number(await maxInput.inputValue());
    expect(initialMax, "El input 'Hasta' arranca en el precio máximo").toBeGreaterThan(0);

    const target = Math.max(1, Math.floor(initialMax / 2));
    await maxInput.fill(String(target));

    await expect(page).toHaveURL(
      new RegExp(`[?&]precio_max=${target}\\b`),
      { timeout: 10_000 },
    );
  });

  test("catálogo mobile no desborda la página y sugiere más categorías", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto("/catalogo");

    await expect(page.locator("aside")).toHaveCount(0);
    const categoryNav = page.getByRole("navigation", { name: "Categorías del catálogo" });
    await expect(categoryNav.locator("li").nth(1)).toBeInViewport();
    const hasPageOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(hasPageOverflow).toBe(false);
  });
});
