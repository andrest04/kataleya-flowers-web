import { expect,test } from "@playwright/test";

test.describe("Phase 4B — Category page", () => {
  test("navegación desde /catalogo a /catalogo/{slug} muestra grid de productos", async ({
    page,
  }) => {
    await page.goto("/catalogo");

    const firstCategoryLink = page
      .locator('a[href^="/catalogo/"]:not([href="/catalogo"])')
      .first();
    await expect(firstCategoryLink).toBeVisible();

    const href = await firstCategoryLink.getAttribute("href");
    expect(href).toMatch(/^\/catalogo\/[a-z0-9-]+$/);

    await page.goto(href ?? "/catalogo");
    await expect(page).toHaveURL(/\/catalogo\/[a-z0-9-]+$/);

    await expect(page.locator("h1").first()).toBeVisible();

    const productGrid = page.locator(
      "main .grid.grid-cols-2.lg\\:grid-cols-3",
    );
    const emptyState = page.getByText(
      /no hay productos disponibles/i,
    );

    const hasProducts = await productGrid.first().isVisible().catch(() => false);
    const isEmpty = await emptyState.isVisible().catch(() => false);
    expect(hasProducts || isEmpty).toBe(true);
  });

  test("cards de producto: imagen (next/image), nombre, precio, link a detalle", async ({
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

    const categoryUrl = page.url();
    const slug = new URL(categoryUrl).pathname.split("/").filter(Boolean)[1];
    expect(slug).toBeTruthy();

    await page
      .waitForFunction(
        ({ s }) =>
          document.querySelectorAll(`a[href^="/catalogo/${s}/"]`).length > 0,
        { s: slug },
        { timeout: 5_000 },
      )
      .catch(() => {});

    const productCards = page.locator(
      `a[href^="/catalogo/${slug}/"]`,
    );

    await expect(
      productCards,
      `La categoría ${slug} no tiene productos: el entorno de test no está sembrado`,
    ).not.toHaveCount(0);

    const firstCard = productCards.first();
    await expect(firstCard).toBeVisible();

    const cardImage = firstCard.locator("img").first();
    await expect(cardImage).toBeVisible();
    const src = await cardImage.getAttribute("src");
    expect(src, "next/image debe haber generado un src").toBeTruthy();
    expect(src ?? "").not.toBe("");

    await expect(firstCard.locator("h3")).toBeVisible();
    await expect(firstCard.getByText(/S\/\s/i).first()).toBeVisible();
  });

  test("ordenamiento: cambiar el <select> reordena sin recarga", async ({
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

    const sortSelect = page.locator("select").first();
    await expect(
      sortSelect,
      "El <select> de orden debe montarse tras hidratar el grid",
    ).toBeVisible({ timeout: 5_000 });

    const slug = new URL(page.url()).pathname.split("/").filter(Boolean)[1];
    const cards = page.locator(`a[href^="/catalogo/${slug}/"]`);

    await page
      .waitForFunction(
        ({ s }) =>
          document.querySelectorAll(`a[href^="/catalogo/${s}/"]`).length > 0,
        { s: slug },
        { timeout: 5_000 },
      )
      .catch(() => {});

    const initialCount = await cards.count();
    expect(
      initialCount,
      "Se necesitan ≥2 productos en la primera categoría para validar el reorden",
    ).toBeGreaterThanOrEqual(2);

    const firstNameBefore = await cards.nth(0).locator("h3").textContent();

    await sortSelect.selectOption("name-asc");

    expect(page.url()).toMatch(/\/catalogo\/[a-z0-9-]+$/);

    await expect(cards.first()).toBeVisible();
    const finalCount = await cards.count();
    expect(finalCount).toBe(initialCount);

    const allNamesAfter = await cards.locator("h3").allTextContents();
    if (allNamesAfter.length >= 2) {
      const sorted = [...allNamesAfter].sort((a, b) => a.localeCompare(b, "es"));
      expect(allNamesAfter).toEqual(sorted);
    }

    expect(firstNameBefore).toBeTruthy();
  });

  test("categoría inexistente renderiza el not-found con categorías sugeridas", async ({
    page,
  }) => {
    await page.goto("/catalogo/__categoria-que-no-existe__");

    await expect(
      page.getByRole("heading", { name: /esta página se cortó/i }),
    ).toBeVisible();

    const suggestions = page.getByRole("navigation", {
      name: "Categorías sugeridas",
    });
    await expect(suggestions).toBeVisible();
    await expect(
      suggestions.getByRole("link", { name: "Ver todo el catálogo" }),
    ).toBeVisible();
  });

  test("back button vuelve a /catalogo", async ({ page }) => {
    await page.goto("/catalogo");

    const firstCategoryLink = page
      .locator('a[href^="/catalogo/"]:not([href="/catalogo"])')
      .first();
    await expect(firstCategoryLink).toBeVisible();
    const categoryHref = await firstCategoryLink.getAttribute("href");
    await page.goto(categoryHref ?? "/catalogo");
    await expect(page).toHaveURL(/\/catalogo\/[a-z0-9-]+$/);

    const backLink = page.getByRole("link", { name: /volver al catálogo/i });
    await expect(backLink).toBeVisible();
    await backLink.click();

    await expect(page).toHaveURL(/\/catalogo$/);
  });
});
