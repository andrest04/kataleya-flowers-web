import { expect, type Page, test } from "@playwright/test";

/**
 * Taxonomy Baseline — migration oracle for product-taxonomy-normalization
 *
 * This spec locks the CURRENT (array-based) observable behavior as a
 * regression safety net. Every test must stay GREEN before, during, and
 * after the DB migration. If any of these tests break after Phase B/C,
 * the migration is NOT behavior-preserving.
 *
 * Covers:
 *  Group 1 — Catalog grid renders products (unfiltered → category grid;
 *             with filters → filtered products + count)
 *  Group 2 — Product detail page: primary image from Appwrite Storage,
 *             gallery thumbnails, h1 title, price
 *  Group 3 — Client-side filters: color + flower-type chips narrow
 *             results; "Limpiar filtros" restores grid
 *  Group 4 — filterProducts identity: nonsense filter → "Sin resultados"
 *             or count drops; no-filter → category grid visible
 *
 * Pattern: reuses navigateToFirstProduct helper inline (copied from
 * product-detail.spec.ts to avoid a shared-state import cycle).
 * Selectors are grounded in the actual component tree — no guessing.
 */

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function escapeForRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Abre el sheet "Filtrar y ordenar", despliega la sección `title` y devuelve
 * el primer checkbox habilitado que contiene.
 *
 * Los filtros ya no viven en un `<aside>`: están en un Sheet (CatalogFilterSheet)
 * con secciones `<details>` y checkboxes `sr-only` dentro de labels.
 */
async function openFilterSection(page: Page, title: string) {
  await page
    .getByRole("button", { name: "Filtrar y ordenar" })
    .first()
    .click();

  const dialog = page.getByRole("dialog", { name: "Filtrar y ordenar" });
  await expect(dialog).toBeVisible();

  const section = dialog.locator("details").filter({
    has: page.getByText(title, { exact: true }),
  });
  await expect(
    section,
    `La sección "${title}" debe existir en el sheet de filtros`,
  ).toHaveCount(1);

  // <details> arranca cerrado salvo Precio; el summary lo despliega.
  const isOpen = await section.evaluate(
    (element: HTMLDetailsElement) => element.open,
  );
  if (!isOpen) await section.locator("summary").click();

  const options = section.locator('input[type="checkbox"]:not([disabled])');
  await expect(
    options,
    `La sección "${title}" no tiene opciones: el entorno de test no está sembrado`,
  ).not.toHaveCount(0);

  return options.first();
}

// ---------------------------------------------------------------------------
// Shared helper — navigate to the first available product detail page.
// Mirrors the helper in product-detail.spec.ts exactly to stay consistent.
// ---------------------------------------------------------------------------

async function navigateToFirstProduct(page: Page): Promise<{
  productHref: string;
  productName: string;
}> {
  await page.goto("/catalogo");

  const firstCategoryLink = page
    .locator('a[href^="/catalogo/"]:not([href="/catalogo"])')
    .first();
  await expect(firstCategoryLink).toBeVisible();
  const categoryHref = await firstCategoryLink.getAttribute("href");
  await page.goto(categoryHref ?? "/catalogo");
  await expect(page).toHaveURL(/\/catalogo\/[a-z0-9-]+$/);

  const slug = new URL(page.url()).pathname.split("/").filter(Boolean)[1];
  const productCards = page.locator(`a[href^="/catalogo/${slug}/"]`);

  await page
    .waitForFunction(
      ({ s }) =>
        document.querySelectorAll(`a[href^="/catalogo/${s}/"]`).length > 0,
      { s: slug },
      { timeout: 10_000 },
    )
    .catch(() => {
      // count=0 handled below
    });

  const count = await productCards.count();
  if (count === 0) {
    throw new Error(
      `Categoría ${slug} sin productos — no se puede navegar al detalle`,
    );
  }

  const firstCard = productCards.first();
  const productHref = (await firstCard.getAttribute("href")) ?? "";
  const productName =
    (await firstCard.locator("h3").textContent())?.trim() ?? "";

  await page.goto(productHref);
  await expect(page).toHaveURL(/\/catalogo\/[a-z0-9-]+\/[a-z0-9-]+$/);
  // Wait for ProductGallery (client component) to hydrate.
  await page
    .locator('button[aria-haspopup="dialog"]')
    .waitFor({ state: "visible", timeout: 15_000 });

  return { productHref, productName };
}

// ---------------------------------------------------------------------------
// Group 1 — Catalog grid baseline
// ---------------------------------------------------------------------------

test.describe("Taxonomy baseline — Group 1: catalog grid", () => {
  test("unfiltered /catalogo renders category grid with valid links", async ({
    page,
  }) => {
    await page.goto("/catalogo");

    await expect(
      page.getByRole("heading", { name: /catálogo/i }).first(),
    ).toBeVisible();

    // Without filters, the category grid is shown (SSR children).
    // Category cards link to /catalogo/{slug} — exactly two path segments.
    // At least one category link visible.
    await expect(
      page.locator('a[href^="/catalogo/"]:not([href="/catalogo"])').first(),
    ).toBeVisible();

    const hrefs = await page
      .locator('a[href^="/catalogo/"]:not([href="/catalogo"])')
      .evaluateAll((links) =>
        links
          .map((l) => (l as HTMLAnchorElement).getAttribute("href") ?? "")
          .filter(
            (href) =>
              href.startsWith("/catalogo/") &&
              href.split("/").filter(Boolean).length === 2,
          ),
      );

    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) {
      expect(href).toMatch(/^\/catalogo\/[a-z0-9-]+$/);
    }
  });

  test("filtered /catalogo with ?q= renders CatalogResults with product count", async ({
    page,
  }) => {
    // A search query activates the filter path → CatalogResults renders.
    await page.goto("/catalogo?q=ramo");

    // The results counter uses role="status" + aria-live="polite".
    const resultStatus = page.locator('[role="status"][aria-live="polite"]');
    await expect(resultStatus).toBeVisible({ timeout: 10_000 });

    const statusText = (await resultStatus.textContent()) ?? "";
    // Either found N products, or "Sin resultados" message.
    const hasResults =
      /producto(s)? encontrado(s)?/i.test(statusText) ||
      /no se encontraron/i.test(statusText);
    expect(hasResults).toBe(true);
  });

  test("category page shows product cards with Appwrite Storage images", async ({
    page,
  }) => {
    await page.goto("/catalogo");

    const firstCategoryLink = page
      .locator('a[href^="/catalogo/"]:not([href="/catalogo"])')
      .first();
    await expect(firstCategoryLink).toBeVisible();
    const categoryHref = await firstCategoryLink.getAttribute("href");
    await page.goto(categoryHref ?? "/catalogo");
    await expect(page).toHaveURL(/\/catalogo\/[a-z0-9-]+$/);

    const slug = new URL(page.url()).pathname.split("/").filter(Boolean)[1];

    await page
      .waitForFunction(
        ({ s }) =>
          document.querySelectorAll(`a[href^="/catalogo/${s}/"]`).length > 0,
        { s: slug },
        { timeout: 10_000 },
      )
      .catch(() => {
        // La aserción de abajo reporta el fallo con el slug concreto.
      });

    const productCards = page.locator(`a[href^="/catalogo/${slug}/"]`);
    await expect(
      productCards,
      `La categoría ${slug} no tiene productos: el entorno de test no está sembrado`,
    ).not.toHaveCount(0);

    // First card: name visible + image with a non-empty src.
    const firstCard = productCards.first();
    await expect(firstCard.locator("h3")).toBeVisible();

    const cardImg = firstCard.locator("img").first();
    await expect(cardImg).toBeVisible();
    const src = await cardImg.getAttribute("src");
    expect(src).toBeTruthy();
    expect(src ?? "").not.toBe("");
  });
});

// ---------------------------------------------------------------------------
// Group 2 — Product detail taxonomy data
// ---------------------------------------------------------------------------

test.describe("Taxonomy baseline — Group 2: product detail", () => {
  test("product detail: h1, Appwrite Storage primary image, price", async ({
    page,
  }) => {
    await navigateToFirstProduct(page);

    // Title.
    await expect(page.locator("h1").first()).toBeVisible();

    // Price in S/ format.
    await expect(page.getByText(/S\/\s/i).first()).toBeVisible();

    // Primary image button (ProductGallery wraps the main image in a
    // button with aria-haspopup="dialog").
    const mainImageButton = page.locator('button[aria-haspopup="dialog"]');
    await expect(mainImageButton).toBeVisible();

    // The image inside should come from Appwrite Storage.
    const mainImg = mainImageButton.locator("img").first();
    await expect(mainImg).toBeVisible();
    const src = await mainImg.getAttribute("src");
    expect(src).toBeTruthy();
    // next/image encodes the URL — verify the Appwrite Storage path is
    // present either raw or URL-encoded.
    const decodedSrc = decodeURIComponent(src ?? "");
    expect(decodedSrc).toMatch(/storage\/buckets\//i);
  });

  test("product detail: gallery thumbnails render when product has multiple images", async ({
    page,
  }) => {
    await navigateToFirstProduct(page);

    const thumbnails = page.locator('button[aria-label^="Ver imagen "]');

    await page
      .waitForFunction(
        () =>
          document.querySelectorAll('button[aria-label^="Ver imagen "]').length >
          0,
        undefined,
        { timeout: 5_000 },
      )
      .catch(() => {
        // La aserción de abajo reporta el fallo con la cuenta real.
      });

    // El primer producto del catálogo debe tener galería múltiple: sin 2+
    // thumbnails este baseline no verifica nada.
    const thumbCount = await thumbnails.count();
    expect(
      thumbCount,
      "El primer producto necesita ≥2 imágenes para validar los thumbnails",
    ).toBeGreaterThanOrEqual(2);

    // Each thumbnail must be visible.
    for (let i = 0; i < Math.min(thumbCount, 4); i++) {
      await expect(thumbnails.nth(i)).toBeVisible();
    }
  });

  test("product detail: description prose section visible", async ({
    page,
  }) => {
    await navigateToFirstProduct(page);

    // Description lives in a .prose > p element.
    await expect(page.locator(".prose p").first()).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Group 3 — Client-side filter parity (color + flower-type)
// ---------------------------------------------------------------------------

test.describe("Taxonomy baseline — Group 3: color and flower-type filters", () => {
  test("filtro de color: marcar el checkbox del sheet sincroniza ?color=", async ({
    page,
  }) => {
    await page.goto("/catalogo");

    const firstColor = await openFilterSection(page, "Color");
    const colorName = (await firstColor.getAttribute("value")) ?? "";
    expect(colorName, "El checkbox de color debe exponer su value").toBeTruthy();

    await firstColor.check();
    await expect(page).toHaveURL(
      new RegExp(`[?&]color=${escapeForRegExp(encodeURIComponent(colorName))}`),
      { timeout: 10_000 },
    );
    await expect(firstColor).toBeChecked();

    await firstColor.uncheck();
    await expect(page).not.toHaveURL(/[?&]color=/, { timeout: 10_000 });
  });

  test("filtro de tipo de flor: marcar el checkbox del sheet sincroniza ?tipo=", async ({
    page,
  }) => {
    await page.goto("/catalogo");

    const firstType = await openFilterSection(page, "Tipo de flor");
    const typeName = (await firstType.getAttribute("value")) ?? "";
    expect(typeName, "El checkbox de tipo de flor debe exponer su value").toBeTruthy();

    await firstType.check();
    await expect(page).toHaveURL(
      new RegExp(`[?&]tipo=${escapeForRegExp(encodeURIComponent(typeName))}`),
      { timeout: 10_000 },
    );
    await expect(firstType).toBeChecked();

    await firstType.uncheck();
    await expect(page).not.toHaveURL(/[?&]tipo=/, { timeout: 10_000 });
  });

  test("color filter via URL: ?color=<name> activates filter and shows results", async ({
    page,
  }) => {
    // Descubrimos un nombre de color real desde el sheet de filtros.
    await page.goto("/catalogo");

    const firstColor = await openFilterSection(page, "Color");
    const colorName = (await firstColor.getAttribute("value")) ?? "";
    expect(colorName, "El checkbox de color debe exponer su value").toBeTruthy();

    // Navigate with that color name as a URL param.
    await page.goto(`/catalogo?color=${encodeURIComponent(colorName)}`);

    // CatalogResults renders with role="status".
    const resultStatus = page.locator('[role="status"][aria-live="polite"]');
    await expect(resultStatus).toBeVisible({ timeout: 10_000 });

    const statusText = (await resultStatus.textContent()) ?? "";
    // Expect either found results OR explicit "no se encontraron" message.
    const isValidState =
      /producto(s)? encontrado(s)?/i.test(statusText) ||
      /no se encontraron/i.test(statusText);
    expect(isValidState).toBe(true);

    // "Limpiar filtros" is visible.
    await expect(
      page.getByRole("button", { name: /limpiar filtros/i }),
    ).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Group 4 — filterProducts identity assertion
// ---------------------------------------------------------------------------

test.describe("Taxonomy baseline — Group 4: filterProducts identity", () => {
  test("no active filter → category grid visible (no results counter)", async ({
    page,
  }) => {
    await page.goto("/catalogo");

    // Without filters, useCatalogFilters returns isFiltersActive=false →
    // children (SSR category grid) are rendered instead of CatalogResults.
    // The role="status" counter should NOT be present.
    const resultStatus = page.locator('[role="status"][aria-live="polite"]');
    await expect(resultStatus).toBeHidden();

    // Category grid is visible.
    const categoryLinks = page.locator(
      'a[href^="/catalogo/"]:not([href="/catalogo"])',
    );
    await expect(categoryLinks.first()).toBeVisible();
  });

  test("nonsense ?q= filter produces 'no se encontraron' or zero-count result", async ({
    page,
  }) => {
    // A gibberish query that should match no product in any real dataset.
    const nonsense = "xzqwerty123nosuchproduct";
    await page.goto(`/catalogo?q=${nonsense}`);

    const resultStatus = page.locator('[role="status"][aria-live="polite"]');
    await expect(resultStatus).toBeVisible({ timeout: 10_000 });

    const statusText = (await resultStatus.textContent()) ?? "";

    // Expect either the empty-results message or a "0 productos" count.
    const isEmptyOrZero =
      /no se encontraron/i.test(statusText) ||
      /^0\s+producto/i.test(statusText.trim());
    expect(isEmptyOrZero).toBe(true);
  });

  test("normal ?q=rosa filter → results counter visible and non-negative", async ({
    page,
  }) => {
    await page.goto("/catalogo?q=rosa");

    const resultStatus = page.locator('[role="status"][aria-live="polite"]');
    await expect(resultStatus).toBeVisible({ timeout: 10_000 });

    const statusText = (await resultStatus.textContent()) ?? "";
    const hasValidStatus =
      /producto(s)? encontrado(s)?/i.test(statusText) ||
      /no se encontraron/i.test(statusText);
    expect(hasValidStatus).toBe(true);
  });

  test("color URL param that does not match any product → zero results", async ({
    page,
  }) => {
    // A color name that cannot exist in any real product taxonomy.
    const nonsenseColor = "ColorQueNoExisteNunca99999";
    await page.goto(`/catalogo?color=${encodeURIComponent(nonsenseColor)}`);

    const resultStatus = page.locator('[role="status"][aria-live="polite"]');
    await expect(resultStatus).toBeVisible({ timeout: 10_000 });

    const statusText = (await resultStatus.textContent()) ?? "";
    const isEmptyOrZero =
      /no se encontraron/i.test(statusText) ||
      /^0\s+producto/i.test(statusText.trim());
    expect(isEmptyOrZero).toBe(true);
  });
});
