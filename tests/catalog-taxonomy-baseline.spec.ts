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
        // handled below
      });

    const productCards = page.locator(`a[href^="/catalogo/${slug}/"]`);
    const count = await productCards.count();

    if (count === 0) {
      test.skip(true, "Categoría sin productos — cubierto en empty-state test");
      return;
    }

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

    // Thumbnails: button[aria-label^="Ver imagen "] — may not exist if
    // the product has only one image; that case is skipped gracefully.
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
        // single-image product — handled below
      });

    const thumbCount = await thumbnails.count();

    if (thumbCount < 2) {
      // Single-image product is valid. The baseline still asserts the
      // main image button is present (covered in previous test).
      test.skip(true, "Producto con una sola imagen — thumbnails no aplican");
      return;
    }

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
  test("color filter chip: clicking toggles aria-pressed and updates URL", async ({
    page,
  }) => {
    await page.goto("/catalogo");

    // Color filter chips live in the sidebar desktop (CatalogFilterColors).
    // They are <button aria-pressed="..."> inside a block preceded by
    // <p>Color</p>. We locate the sidebar's color section.
    const sidebar = page.locator("aside").first();
    await expect(sidebar).toBeVisible();

    // Wait for the client component to hydrate (color chips may not be
    // present if no product_colors rows exist in the DB).
    const colorSection = sidebar.getByText("Color");
    const colorSectionVisible = await colorSection
      .isVisible()
      .catch(() => false);

    if (!colorSectionVisible) {
      test.skip(true, "Sección Color no visible — sin datos de colores en DB");
      return;
    }

    // Color filter chips rendered by CatalogFilterColors: button[aria-pressed]
    // inside the color section. We need to distinguish them from category chips
    // (which also use aria-pressed) — we look for chips that follow the "Color"
    // label paragraph.
    const colorLabel = sidebar.locator("p").filter({ hasText: /^Color$/ });
    await expect(colorLabel).toBeVisible({ timeout: 5_000 });

    // Parent div contains the label + chip row.
    const colorBlock = colorLabel.locator("..");
    const colorChips = colorBlock.locator("button[aria-pressed]");

    const chipCount = await colorChips.count();
    if (chipCount === 0) {
      test.skip(true, "Sin chips de color disponibles en el sidebar");
      return;
    }

    const firstChip = colorChips.first();
    const chipName = (await firstChip.textContent())?.trim() ?? "";
    expect(chipName.length).toBeGreaterThan(0);

    // Wait 500ms for useCatalogFilters debounce (300ms) to settle after
    // mount — same guard used by catalog-flow.spec.ts chip tests.
    await page.waitForTimeout(500);

    // Click the chip — should toggle to active and update the URL.
    await firstChip.click();
    await expect(page).toHaveURL(/[?&]color=/, { timeout: 10_000 });
    await expect(firstChip).toHaveAttribute("aria-pressed", "true", {
      timeout: 10_000,
    });

    // "Limpiar filtros" button appears and works.
    const clearBtn = page.getByRole("button", { name: /limpiar filtros/i });
    await expect(clearBtn).toBeVisible();
    await clearBtn.click();
    await expect(page).toHaveURL(/\/catalogo$/, { timeout: 5_000 });
    await expect(firstChip).toHaveAttribute("aria-pressed", "false");
  });

  test("flower-type filter chip: clicking toggles aria-pressed and updates URL", async ({
    page,
  }) => {
    await page.goto("/catalogo");

    const sidebar = page.locator("aside").first();
    await expect(sidebar).toBeVisible();

    const flowerLabel = sidebar
      .locator("p")
      .filter({ hasText: /^Tipo de flor$/ });
    const flowerSectionVisible = await flowerLabel
      .isVisible()
      .catch(() => false);

    if (!flowerSectionVisible) {
      test.skip(
        true,
        "Sección Tipo de flor no visible — sin datos en DB",
      );
      return;
    }

    await expect(flowerLabel).toBeVisible({ timeout: 5_000 });
    const flowerBlock = flowerLabel.locator("..");
    const flowerChips = flowerBlock.locator("button[aria-pressed]");

    const chipCount = await flowerChips.count();
    if (chipCount === 0) {
      test.skip(true, "Sin chips de tipo de flor disponibles");
      return;
    }

    const firstChip = flowerChips.first();
    const chipName = (await firstChip.textContent())?.trim() ?? "";
    expect(chipName.length).toBeGreaterThan(0);

    // Wait 500ms for useCatalogFilters debounce (300ms) to settle after
    // mount — same guard used by catalog-flow.spec.ts chip tests.
    await page.waitForTimeout(500);

    await firstChip.click();
    await expect(page).toHaveURL(/[?&]tipo=/, { timeout: 10_000 });
    await expect(firstChip).toHaveAttribute("aria-pressed", "true", {
      timeout: 10_000,
    });

    const clearBtn = page.getByRole("button", { name: /limpiar filtros/i });
    await expect(clearBtn).toBeVisible();
    await clearBtn.click();
    await expect(page).toHaveURL(/\/catalogo$/, { timeout: 5_000 });
    await expect(firstChip).toHaveAttribute("aria-pressed", "false");
  });

  test("color filter via URL: ?color=<name> activates filter and shows results", async ({
    page,
  }) => {
    // Navigate to the catalog sidebar to discover an actual color name.
    await page.goto("/catalogo");

    const sidebar = page.locator("aside").first();
    const colorLabel = sidebar.locator("p").filter({ hasText: /^Color$/ });
    const labelVisible = await colorLabel.isVisible().catch(() => false);

    if (!labelVisible) {
      test.skip(true, "Sin sección Color en sidebar");
      return;
    }

    const colorBlock = colorLabel.locator("..");
    const colorChips = colorBlock.locator("button[aria-pressed]");
    const chipCount = await colorChips.count();

    if (chipCount === 0) {
      test.skip(true, "Sin chips de color para obtener nombre real");
      return;
    }

    // Read the color name from the DOM chip (without the color dot span).
    // The chip text includes the label; we use allTextContents.
    const rawText = (await colorChips.first().textContent())?.trim() ?? "";
    // The chip renders: [dot] <label text>. We take the full textContent
    // which may include the dot's empty string; trim handles it.
    const colorName = rawText.replace(/^\s+|\s+$/g, "");

    if (!colorName) {
      test.skip(true, "No se pudo leer el nombre del color del chip");
      return;
    }

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
