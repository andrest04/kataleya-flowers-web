import { expect, type Page,test } from "@playwright/test";

import { BUSINESS } from "../src/lib/constants";

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
    throw new Error(`Categoría ${slug} sin productos — no se puede testear detalle`);
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

test.describe("Phase 4B — Product detail", () => {
  test("carga del detalle: título, precio, descripción, galería", async ({
    page,
  }) => {
    await navigateToFirstProduct(page);

    await expect(page.locator("h1").first()).toBeVisible();

    await expect(page.getByText(/S\/\s/i).first()).toBeVisible();

    await expect(page.locator(".prose p").first()).toBeVisible();

    await expect(page.locator('button[aria-haspopup="dialog"]')).toBeVisible();
  });

  test("thumbnails: click cambia el aria-pressed y la imagen principal", async ({
    page,
  }) => {
    await navigateToFirstProduct(page);

    await expect(page).toHaveURL(/\/catalogo\/[a-z0-9-]+\/[a-z0-9-]+$/);

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
      "El primer producto necesita ≥2 imágenes para validar el cambio de thumbnail",
    ).toBeGreaterThanOrEqual(2);

    const firstUnpressed = thumbnails.filter({
      has: page.locator(":scope[aria-pressed='false']"),
    });
    const target = (await firstUnpressed.count()) > 0
      ? firstUnpressed.first()
      : thumbnails.nth(1);

    await target.click();
    await expect(target).toHaveAttribute("aria-pressed", "true");
  });

  test("lightbox: click en imagen principal abre dialog modal con role + aria-modal", async ({
    page,
  }) => {
    await navigateToFirstProduct(page);

    const mainImageButton = page.locator('button[aria-haspopup="dialog"]');
    await expect(mainImageButton).toBeVisible();
    await mainImageButton.click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible({ timeout: 8_000 });

    const ariaModal = await dialog.getAttribute("aria-modal");
    if (ariaModal !== null) {
      expect(ariaModal).toBe("true");
    }

    const overlayZ = await page
      .locator(".fixed.inset-0.z-\\[100\\]")
      .first()
      .evaluate((el) => getComputedStyle(el).zIndex);
    expect(Number(overlayZ)).toBeGreaterThanOrEqual(100);
  });

  test("lightbox: ArrowLeft/ArrowRight navegan, Escape cierra", async ({
    page,
  }) => {
    await navigateToFirstProduct(page);

    const thumbnails = page.locator('button[aria-label^="Ver imagen "]');
    const thumbCount = await thumbnails.count();

    await page.locator('button[aria-haspopup="dialog"]').click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    if (thumbCount >= 2) {
      const counter = page.locator("[aria-live='polite']").first();
      const before = (await counter.textContent())?.trim();

      await page.keyboard.press("ArrowRight");
      await expect
        .poll(async () => (await counter.textContent())?.trim())
        .not.toBe(before);

      const afterRight = (await counter.textContent())?.trim();

      await page.keyboard.press("ArrowLeft");
      await expect
        .poll(async () => (await counter.textContent())?.trim())
        .not.toBe(afterRight);
    }

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("lightbox: botón Cerrar y click en backdrop cierran el modal", async ({
    page,
  }) => {
    await navigateToFirstProduct(page);

    const mainImageButton = page.locator('button[aria-haspopup="dialog"]');
    await mainImageButton.click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    await page.getByRole("button", { name: "Cerrar" }).click();
    await expect(dialog).toBeHidden();

    await mainImageButton.click();
    await expect(dialog).toBeVisible();

    const viewport = page.viewportSize();
    if (!viewport) {
      throw new Error("El proyecto de Playwright debe definir un viewport");
    }
    await page.mouse.click(10, viewport.height - 10);

    await expect(dialog).toBeHidden();
  });

  test("lightbox a11y: role=dialog, focus dentro del dialog al abrir", async ({
    page,
  }) => {
    await navigateToFirstProduct(page);

    const mainImageButton = page.locator('button[aria-haspopup="dialog"]');
    await expect(mainImageButton).toBeVisible();

    await mainImageButton.focus();
    await mainImageButton.click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible({ timeout: 8_000 });

    const ariaModal = await dialog.getAttribute("aria-modal");
    if (ariaModal !== null) {
      expect(ariaModal).toBe("true");
    }

    const activeInsideDialog = await page.evaluate(() => {
      const active = document.activeElement;
      if (!active) return false;
      const dialog = document.querySelector('[role="dialog"]');
      return dialog?.contains(active) ?? false;
    });
    expect(activeInsideDialog).toBe(true);

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("lightbox a11y: focus restaurado al trigger después de cerrar", async ({
    page,
  }) => {
    await navigateToFirstProduct(page);

    const mainImageButton = page.locator('button[aria-haspopup="dialog"]');
    await mainImageButton.focus();
    await mainImageButton.click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible({ timeout: 8_000 });

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();

    await expect
      .poll(
        async () =>
          page.evaluate(() =>
            document.activeElement?.getAttribute("aria-haspopup"),
          ),
        { timeout: 3_000 },
      )
      .toBe("dialog");
  });

  test("WhatsApp CTA: link a wa.me/{phone} con texto del producto", async ({
    page,
  }) => {
    const { productName } = await navigateToFirstProduct(page);

    const whatsappSelector = `a[href*="wa.me/${BUSINESS.phone}"]`;
    const whatsappLink = page.locator(whatsappSelector);
    await expect(whatsappLink.first()).toBeVisible();

    const href = await whatsappLink.first().getAttribute("href");
    expect(href).toBeTruthy();
    expect(href).toContain(`wa.me/${BUSINESS.phone}`);
    expect(href).toMatch(/\?text=/);

    const url = new URL(href ?? "");
    const text = url.searchParams.get("text") ?? "";
    expect(text).toContain(productName);
    expect(text.toLowerCase()).toContain("hola");
  });
});
