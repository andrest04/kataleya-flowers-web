import { expect,test } from "@playwright/test";

/**
 * Phase 4B — Página de categoría
 *
 * Cubre /catalogo/{slug}:
 *  - Navegación desde /catalogo
 *  - Cards con next/image (no <img> nativo sin clase next-*)
 *  - Ordenamiento client-side
 *  - Empty state (skip si no se puede reproducir)
 *  - Botón "Volver al catálogo"
 */

test.describe("Phase 4B — Category page", () => {
  test("navegación desde /catalogo a /catalogo/{slug} muestra grid de productos", async ({
    page,
  }) => {
    await page.goto("/catalogo");

    // Tomamos el primer link de categoría (excluye el del breadcrumb /catalogo a secas).
    const firstCategoryLink = page
      .locator('a[href^="/catalogo/"]:not([href="/catalogo"])')
      .first();
    await expect(firstCategoryLink).toBeVisible();

    const href = await firstCategoryLink.getAttribute("href");
    expect(href).toMatch(/^\/catalogo\/[a-z0-9-]+$/);

    // Navegamos directamente al href en vez de clickear el <Link>: es
    // equivalente y evita flake de transición en dev.
    await page.goto(href ?? "/catalogo");
    await expect(page).toHaveURL(/\/catalogo\/[a-z0-9-]+$/);

    // Heading h1 con el nombre de la categoría.
    await expect(page.locator("h1").first()).toBeVisible();

    // Hay grid de productos o empty state.
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

    // Tomamos el href de la primera categoría y navegamos directamente por URL
    // (equivalente al click, evita flake de transición en dev).
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

    // Esperamos a que las cards SSR aparezcan en el DOM.
    await page
      .waitForFunction(
        ({ s }) =>
          document.querySelectorAll(`a[href^="/catalogo/${s}/"]`).length > 0,
        { s: slug },
        { timeout: 5_000 },
      )
      .catch(() => {
        // La aserción de abajo reporta el fallo con el slug concreto.
      });

    // ProductCard envuelve todo en <Link href="/catalogo/{categorySlug}/{productSlug}">.
    const productCards = page.locator(
      `a[href^="/catalogo/${slug}/"]`,
    );

    // La primera categoría del catálogo debe tener productos. Si no los tiene,
    // el entorno de test está mal sembrado y eso es un fallo, no un skip.
    await expect(
      productCards,
      `La categoría ${slug} no tiene productos: el entorno de test no está sembrado`,
    ).not.toHaveCount(0);

    const firstCard = productCards.first();
    await expect(firstCard).toBeVisible();

    // Imagen renderizada por next/image: el <img> resultante tiene `srcset`.
    const cardImage = firstCard.locator("img").first();
    await expect(cardImage).toBeVisible();
    const src = await cardImage.getAttribute("src");
    expect(src, "next/image debe haber generado un src").toBeTruthy();
    // next/image usa el endpoint optimizado /_next/image o una URL directa
    // del CDN. NO debe estar vacío.
    expect(src ?? "").not.toBe("");

    // Nombre + precio dentro de la card.
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

    // Esperamos a que el ProductGrid (client component) hidrate y monte
    // el <select> de ordenamiento.
    const sortSelect = page.locator("select").first();
    await expect(
      sortSelect,
      "El <select> de orden debe montarse tras hidratar el grid",
    ).toBeVisible({ timeout: 5_000 });

    const slug = new URL(page.url()).pathname.split("/").filter(Boolean)[1];
    const cards = page.locator(`a[href^="/catalogo/${slug}/"]`);

    // Esperamos a que el grid cargue (SSR puede tardar 1 tick).
    await page
      .waitForFunction(
        ({ s }) =>
          document.querySelectorAll(`a[href^="/catalogo/${s}/"]`).length > 0,
        { s: slug },
        { timeout: 5_000 },
      )
      .catch(() => {
        // La aserción de abajo reporta el fallo con la cuenta real.
      });

    // Reordenar solo es observable con 2+ productos. Menos que eso significa
    // entorno mal sembrado, no un caso válido que se pueda saltear.
    const initialCount = await cards.count();
    expect(
      initialCount,
      "Se necesitan ≥2 productos en la primera categoría para validar el reorden",
    ).toBeGreaterThanOrEqual(2);

    const firstNameBefore = await cards.nth(0).locator("h3").textContent();

    // Cambiamos a "Nombre: A–Z" — debería ser determinístico.
    await sortSelect.selectOption("name-asc");

    // Sin recarga: la URL no cambia.
    expect(page.url()).toMatch(/\/catalogo\/[a-z0-9-]+$/);

    // El primer nombre puede o no haber cambiado dependiendo del orden inicial,
    // pero el grid sigue visible y con la misma cantidad de productos.
    await expect(cards.first()).toBeVisible();
    const finalCount = await cards.count();
    expect(finalCount).toBe(initialCount);

    // Validamos que el sort tuvo efecto (el primer nombre A–Z debe ser
    // lexicográficamente <= todos los demás en español).
    const allNamesAfter = await cards.locator("h3").allTextContents();
    if (allNamesAfter.length >= 2) {
      const sorted = [...allNamesAfter].sort((a, b) => a.localeCompare(b, "es"));
      expect(allNamesAfter).toEqual(sorted);
    }

    // Pequeña sanity: el nombre antes-vs-después puede ser distinto si el
    // orden default no era alfabético.
    expect(firstNameBefore).toBeTruthy();
  });

  test("categoría inexistente renderiza el not-found con categorías sugeridas", async ({
    page,
  }) => {
    // Next dispara notFound() y renderiza app/(public)/not-found.tsx. El status
    // HTTP varía según versión de Next, así que asertamos el contenido real.
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

    // BackButton es <Link href="/catalogo"> con label "Volver al catálogo".
    const backLink = page.getByRole("link", { name: /volver al catálogo/i });
    await expect(backLink).toBeVisible();
    await backLink.click();

    await expect(page).toHaveURL(/\/catalogo$/);
  });
});
