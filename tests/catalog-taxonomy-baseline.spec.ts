import { expect, type Page, test } from "@playwright/test";

function escapeForRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

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
    .catch(() => {});

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
  await page
    .locator('button[aria-haspopup="dialog"]')
    .waitFor({ state: "visible", timeout: 15_000 });

  return { productHref, productName };
}

test.describe("Taxonomy baseline — Group 1: catalog grid", () => {
  test("unfiltered /catalogo renders category grid with valid links", async ({
    page,
  }) => {
    await page.goto("/catalogo");

    await expect(
      page.getByRole("heading", { name: /catálogo/i }).first(),
    ).toBeVisible();

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
    await page.goto("/catalogo?q=ramo");

    const resultStatus = page.locator('[role="status"][aria-live="polite"]');
    await expect(resultStatus).toBeVisible({ timeout: 10_000 });

    const statusText = (await resultStatus.textContent()) ?? "";
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
      .catch(() => {});

    const productCards = page.locator(`a[href^="/catalogo/${slug}/"]`);
    await expect(
      productCards,
      `La categoría ${slug} no tiene productos: el entorno de test no está sembrado`,
    ).not.toHaveCount(0);

    const firstCard = productCards.first();
    await expect(firstCard.locator("h3")).toBeVisible();

    const cardImg = firstCard.locator("img").first();
    await expect(cardImg).toBeVisible();
    const src = await cardImg.getAttribute("src");
    expect(src).toBeTruthy();
    expect(src ?? "").not.toBe("");
  });
});

test.describe("Taxonomy baseline — Group 2: product detail", () => {
  test("product detail: h1, Appwrite Storage primary image, price", async ({
    page,
  }) => {
    await navigateToFirstProduct(page);

    await expect(page.locator("h1").first()).toBeVisible();

    await expect(page.getByText(/S\/\s/i).first()).toBeVisible();

    const mainImageButton = page.locator('button[aria-haspopup="dialog"]');
    await expect(mainImageButton).toBeVisible();

    const mainImg = mainImageButton.locator("img").first();
    await expect(mainImg).toBeVisible();
    const src = await mainImg.getAttribute("src");
    expect(src).toBeTruthy();
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
      .catch(() => {});

    const thumbCount = await thumbnails.count();
    expect(
      thumbCount,
      "El primer producto necesita ≥2 imágenes para validar los thumbnails",
    ).toBeGreaterThanOrEqual(2);

    for (let i = 0; i < Math.min(thumbCount, 4); i++) {
      await expect(thumbnails.nth(i)).toBeVisible();
    }
  });

  test("product detail: description prose section visible", async ({
    page,
  }) => {
    await navigateToFirstProduct(page);

    await expect(page.locator(".prose p").first()).toBeVisible();
  });
});

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
    await page.goto("/catalogo");

    const firstColor = await openFilterSection(page, "Color");
    const colorName = (await firstColor.getAttribute("value")) ?? "";
    expect(colorName, "El checkbox de color debe exponer su value").toBeTruthy();

    await page.goto(`/catalogo?color=${encodeURIComponent(colorName)}`);

    const resultStatus = page.locator('[role="status"][aria-live="polite"]');
    await expect(resultStatus).toBeVisible({ timeout: 10_000 });

    const statusText = (await resultStatus.textContent()) ?? "";
    const isValidState =
      /producto(s)? encontrado(s)?/i.test(statusText) ||
      /no se encontraron/i.test(statusText);
    expect(isValidState).toBe(true);

    await expect(
      page.getByRole("button", { name: /limpiar filtros/i }),
    ).toBeVisible();
  });
});

test.describe("Taxonomy baseline — Group 4: filterProducts identity", () => {
  test("no active filter → category grid visible (no results counter)", async ({
    page,
  }) => {
    await page.goto("/catalogo");

    const resultStatus = page.locator('[role="status"][aria-live="polite"]');
    await expect(resultStatus).toBeHidden();

    const categoryLinks = page.locator(
      'a[href^="/catalogo/"]:not([href="/catalogo"])',
    );
    await expect(categoryLinks.first()).toBeVisible();
  });

  test("nonsense ?q= filter produces 'no se encontraron' or zero-count result", async ({
    page,
  }) => {
    const nonsense = "xzqwerty123nosuchproduct";
    await page.goto(`/catalogo?q=${nonsense}`);

    const resultStatus = page.locator('[role="status"][aria-live="polite"]');
    await expect(resultStatus).toBeVisible({ timeout: 10_000 });

    const statusText = (await resultStatus.textContent()) ?? "";

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
