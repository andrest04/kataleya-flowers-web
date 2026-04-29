import { expect, type Page,test } from "@playwright/test";

/**
 * Phase 4B — SEO + structured data
 *
 * Phase 4A YA terminó: titles sin duplicar `| Kataleya Flawers`, JSON-LD
 * Florist (root), Product + BreadcrumbList por producto, BreadcrumbList +
 * ItemList en /catalogo y /catalogo/[categoria], OG/Twitter por producto.
 */

interface JsonLdScript {
  "@type"?: string | string[];
  "@graph"?: JsonLdScript[];
  // Permitimos el resto de propiedades sin tiparlas (cada @type tiene su shape).
  [key: string]: unknown;
}

async function getJsonLdBlocks(page: Page): Promise<JsonLdScript[]> {
  const blocks = await page
    .locator('script[type="application/ld+json"]')
    .allTextContents();
  const parsed: JsonLdScript[] = [];
  for (const raw of blocks) {
    try {
      const json = JSON.parse(raw) as JsonLdScript | JsonLdScript[];
      if (Array.isArray(json)) {
        parsed.push(...json);
      } else {
        parsed.push(json);
      }
    } catch {
      // Ignore — JSON-LD malformed shouldn't crash el spec aquí.
    }
  }
  return parsed;
}

function hasType(blocks: JsonLdScript[], type: string): boolean {
  return blocks.some((b) => {
    if (b["@type"] === type) return true;
    if (Array.isArray(b["@type"]) && b["@type"].includes(type)) return true;
    if (Array.isArray(b["@graph"])) {
      return b["@graph"].some((g) => {
        if (g["@type"] === type) return true;
        if (Array.isArray(g["@type"]) && g["@type"].includes(type)) return true;
        return false;
      });
    }
    return false;
  });
}

async function navigateToFirstProduct(page: Page): Promise<void> {
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
      // skip handling below
    });
  const count = await productCards.count();
  if (count === 0) {
    throw new Error(`Categoría ${slug} sin productos`);
  }
  const productHref = await productCards.first().getAttribute("href");
  await page.goto(productHref ?? "/catalogo");
  await expect(page).toHaveURL(/\/catalogo\/[a-z0-9-]+\/[a-z0-9-]+$/);
}

test.describe("Phase 4B — SEO metadata + JSON-LD", () => {
  // ---- Structured data global ----------------------------------------------

  test("JSON-LD Florist en root /", async ({ page }) => {
    await page.goto("/");
    const blocks = await getJsonLdBlocks(page);
    expect(
      hasType(blocks, "Florist"),
      "Debe haber un bloque JSON-LD con @type Florist",
    ).toBe(true);
  });

  // ---- Titles sin duplicación ----------------------------------------------

  test("title /catalogo NO tiene '| Kataleya Flawers' duplicado", async ({
    page,
  }) => {
    await page.goto("/catalogo");
    const title = await page.title();
    const occurrences = (title.match(/Kataleya Flawers/g) ?? []).length;
    expect(occurrences).toBe(1);
  });

  test("title /catalogo/{categoria} NO tiene '| Kataleya Flawers' duplicado", async ({
    page,
  }) => {
    await page.goto("/catalogo");
    const firstCategoryLink = page
      .locator('a[href^="/catalogo/"]:not([href="/catalogo"])')
      .first();
    const href = await firstCategoryLink.getAttribute("href");
    await page.goto(href ?? "/catalogo");

    const title = await page.title();
    const occurrences = (title.match(/Kataleya Flawers/g) ?? []).length;
    expect(occurrences).toBe(1);
  });

  test("title producto detalle NO tiene '| Kataleya Flawers' duplicado", async ({
    page,
  }) => {
    await navigateToFirstProduct(page);
    const title = await page.title();
    const occurrences = (title.match(/Kataleya Flawers/g) ?? []).length;
    expect(occurrences).toBe(1);
  });

  // ---- Structured data por página -----------------------------------------

  test("JSON-LD Product en /catalogo/{categoria}/{slug}", async ({ page }) => {
    await navigateToFirstProduct(page);
    const blocks = await getJsonLdBlocks(page);
    expect(hasType(blocks, "Product")).toBe(true);
  });

  test("JSON-LD BreadcrumbList en /catalogo", async ({ page }) => {
    await page.goto("/catalogo");
    const blocks = await getJsonLdBlocks(page);
    expect(hasType(blocks, "BreadcrumbList")).toBe(true);
  });

  test("JSON-LD BreadcrumbList en /catalogo/{categoria}", async ({ page }) => {
    await page.goto("/catalogo");
    const firstCategoryLink = page
      .locator('a[href^="/catalogo/"]:not([href="/catalogo"])')
      .first();
    const href = await firstCategoryLink.getAttribute("href");
    await page.goto(href ?? "/catalogo");

    const blocks = await getJsonLdBlocks(page);
    expect(hasType(blocks, "BreadcrumbList")).toBe(true);
  });

  test("og:image específica del producto (no fallback genérico)", async ({
    page,
  }) => {
    await navigateToFirstProduct(page);
    const productOgImage = await page
      .locator('meta[property="og:image"]')
      .first()
      .getAttribute("content");

    expect(productOgImage).toBeTruthy();
    // La imagen del producto NO debe ser la imagen genérica del root
    // (next/metadata genera /opengraph-image cuando no se setea openGraph.images).
    expect(productOgImage).not.toContain("/opengraph-image");
    // Debe ser una URL absoluta — Cloudinary CDN o fallback a public/.
    expect(productOgImage).toMatch(/^https?:\/\//);
  });
});
