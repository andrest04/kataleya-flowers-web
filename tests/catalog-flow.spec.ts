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
  test("listado de catálogo: grid de categorías y links válidos a /catalogo/{slug}", async ({
    page,
  }) => {
    await page.goto("/catalogo");

    await expect(
      page.getByRole("heading", { name: /catálogo/i }).first(),
    ).toBeVisible();

    // Las category cards son <Link href="/catalogo/{slug}"> (sin slug adicional).
    // Filtramos para excluir el link "Catálogo" del breadcrumb (href === '/catalogo' exacto).
    const categoryLinks = page.locator(
      'a[href^="/catalogo/"]:not([href="/catalogo"])',
    );
    await expect(categoryLinks.first()).toBeVisible();

    const hrefs = await categoryLinks.evaluateAll((links) =>
      links
        .map((l) => (l as HTMLAnchorElement).getAttribute("href") ?? "")
        .filter(
          (href) =>
            href.startsWith("/catalogo/") &&
            href !== "/catalogo/" &&
            // Solo categorías directas /catalogo/{slug}, sin slug adicional.
            href.split("/").filter(Boolean).length === 2,
        ),
    );

    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) {
      expect(href).toMatch(/^\/catalogo\/[a-z0-9-]+$/);
    }

    await page.screenshot({
      path: `${SCREENSHOT_DIR}/catalogo-grid.png`,
      fullPage: true,
    });
  });

  test("filtros con URL params: ?q=rosa hidrata el input y muestra estado filtrado", async ({
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

  test("filtros UI: escribir 'ramo' actualiza URL tras debounce y X limpia", async ({
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

  test("filtro de precio: precio_min/precio_max se reflejan en URL", async ({
    page,
  }) => {
    await page.goto("/catalogo");
    const minInput = page.getByLabel("Precio mínimo").first();
    const maxInput = page.getByLabel("Precio máximo").first();

    await expect(minInput).toBeVisible();

    await minInput.focus();
    await page.keyboard.type("50", { delay: 30 });

    await expect(page).toHaveURL(/precio_min=50/, { timeout: 8_000 });

    await maxInput.focus();
    await page.keyboard.type("200", { delay: 30 });

    await expect(page).toHaveURL(/precio_max=200/, { timeout: 8_000 });

    await expect(
      page.getByRole("button", { name: /limpiar filtros/i }).first(),
    ).toBeVisible();
  });

  test("filtro de precio: setear precio_max=500 vía URL hidrata el input correctamente", async ({
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

  test("filtro de categoría desde sidebar: chip de categoría sincroniza ?categoria=", async ({
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

  test("mobile drawer de filtros: botón con aria-expanded toggleable en viewport 375x667", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/catalogo");

    // En mobile, el botón "Filtros" vive dentro del CatalogSearchMobile.
    const filtersToggle = page.getByRole("button", { name: /^filtros/i });
    await expect(filtersToggle).toBeVisible();
    await expect(filtersToggle).toHaveAttribute("aria-expanded", "false");

    await filtersToggle.click();
    await expect(filtersToggle).toHaveAttribute("aria-expanded", "true");

    await filtersToggle.click();
    await expect(filtersToggle).toHaveAttribute("aria-expanded", "false");
  });
});
