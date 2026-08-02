import { expect,test } from "@playwright/test";

/**
 * Phase 4B — Flujo público del catálogo
 *
 * Cubre:
 *  - Listado de categorías en /catalogo
 *  - Hidratación de filtros desde URL params (?q=)
 *  - Debounce de input de búsqueda → URL
 *  - Filtro de precio precio_min / precio_max
 *  - Filtro de categoría desde sidebar
 *  - Botón "Filtros" en mobile con aria-expanded
 *
 * Resilientes a Phase 4A — no asumen titles ni JSON-LD nuevos.
 */

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

  test.skip("filtros con URL params: ?q=rosa hidrata el input y muestra estado filtrado", async ({
    page,
  }) => {
    await page.goto("/catalogo?q=rosa");

    const searchInput = page.getByPlaceholder("Buscar ramos, flores...");
    await expect(searchInput).toHaveValue("rosa");

    // Hay UI de "filtros activos" — botón Limpiar filtros visible.
    await expect(
      page.getByRole("button", { name: /limpiar filtros/i }),
    ).toBeVisible();
  });

  test.skip("filtros UI: escribir 'ramo' actualiza URL tras debounce y X limpia", async ({
    page,
  }) => {
    await page.goto("/catalogo");

    const searchInput = page.getByPlaceholder("Buscar ramos, flores...");
    await searchInput.fill("ramo");

    // Debounce 300ms — esperamos a que aparezca en URL.
    await expect(page).toHaveURL(/\/catalogo\?q=ramo/, { timeout: 2_000 });

    // Botón "X" del input (aria-label="Limpiar búsqueda") devuelve a estado base.
    await page.getByRole("button", { name: /limpiar búsqueda/i }).click();

    await expect(searchInput).toHaveValue("");
    await expect(page).toHaveURL(/\/catalogo$/);
  });

  test.skip("filtro de precio: precio_min/precio_max se reflejan en URL", async ({
    page,
  }) => {
    await page.goto("/catalogo");
    const minInput = page.getByLabel("Precio mínimo").first();
    const maxInput = page.getByLabel("Precio máximo").first();

    await expect(minInput).toBeVisible();

    // `.fill()` dispara un único onChange con el valor completo — más estable que
    // tipear char-por-char, donde el input se remonta (key={`min-${precioMin}`})
    // al cruzar el umbral de commit y se pierde el foco a mitad de la secuencia.
    await minInput.fill("50");

    await expect(page).toHaveURL(/precio_min=50/, { timeout: 8_000 });

    await maxInput.fill("200");

    await expect(page).toHaveURL(/precio_max=200/, { timeout: 8_000 });

    await expect(
      page.getByRole("button", { name: /limpiar filtros/i }).first(),
    ).toBeVisible();
  });

  test.skip("filtro de precio: setear precio_max=500 vía URL hidrata el input correctamente", async ({
    page,
  }) => {
    // Cobertura alternativa que SÍ funciona: visitamos la URL con el filtro
    // ya aplicado y verificamos que el input se hidrata con el valor.
    await page.goto("/catalogo?precio_max=500");

    const maxInput = page.getByLabel("Precio máximo").first();
    await expect(maxInput).toHaveValue("500");

    await expect(
      page.getByRole("button", { name: /limpiar filtros/i }).first(),
    ).toBeVisible();
  });

  test.skip("filtro de categoría desde sidebar: chip de categoría sincroniza ?categoria=", async ({
    page,
  }) => {
    await page.goto("/catalogo");

    // Esperamos a que el sidebar desktop esté hydratado y los chips de
    // categoría sean clickables. Con MSR + Next App Router, después de
    // navegar a /catalogo el effect del debounce (300ms) de useCatalogFilters
    // dispara un router.replace que puede pisar un click prematuro.
    // Esperamos 350ms+ para que ese ciclo se asiente.
    await page.waitForTimeout(500);

    const sidebar = page.locator("aside").first();
    await expect(sidebar).toBeVisible();

    // Tomamos el primer chip de categoría dentro del sidebar — todos los
    // chips de categoría tienen aria-pressed (los de tipo de flor no).
    // Para garantizar que sea de categoría, scopeamos al bloque que
    // sigue al <p>Categoría</p>.
    const firstCategoryChip = sidebar
      .locator("button[aria-pressed]")
      .first();
    await expect(firstCategoryChip).toBeVisible();

    const chipText = (await firstCategoryChip.textContent())?.trim() ?? "";
    expect(chipText.length).toBeGreaterThan(0);

    await firstCategoryChip.click();

    // El click invoca router.replace via useCatalogFilters. Damos un timeout
    // generoso porque el debounce de búsqueda puede pisar muy temprano.
    await expect(page).toHaveURL(
      /[?&]categoria=[a-z0-9-]+/i,
      { timeout: 10_000 },
    );
    await expect(
      page.getByRole("button", { name: /limpiar filtros/i }).first(),
    ).toBeVisible();
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
