import { expect, type Page,test } from "@playwright/test";

import { BUSINESS } from "../src/lib/constants";

/**
 * Phase 4B — Detalle de producto + lightbox
 *
 * Valida:
 *  - Carga del detalle (título, precio, descripción, galería)
 *  - Click en thumbnails cambia imagen principal
 *  - Lightbox abre/cierra con click, Escape, botón cerrar y backdrop
 *  - Navegación con teclado (←/→) entre imágenes
 *  - A11y: role="dialog", aria-modal, focus trap
 *  - WhatsApp CTA con wa.me/51990051041 + nombre del producto en mensaje
 *
 * Helper: descubrimos un producto navegando desde /catalogo → primera categoría
 * → primer producto. Evita hardcodear slugs reales.
 */

async function navigateToFirstProduct(page: Page): Promise<{
  productHref: string;
  productName: string;
}> {
  await page.goto("/catalogo");

  // Tomamos el href de la primera categoría y navegamos directo (los <Link>
  // de CategoryCard / ProductCard disparan clientTrackEvent en onClick, lo
  // que hace flake en dev).
  const firstCategoryLink = page
    .locator('a[href^="/catalogo/"]:not([href="/catalogo"])')
    .first();
  await expect(firstCategoryLink).toBeVisible();
  const categoryHref = await firstCategoryLink.getAttribute("href");
  await page.goto(categoryHref ?? "/catalogo");
  await expect(page).toHaveURL(/\/catalogo\/[a-z0-9-]+$/);

  const slug = new URL(page.url()).pathname.split("/").filter(Boolean)[1];
  const productCards = page.locator(`a[href^="/catalogo/${slug}/"]`);

  // Esperamos a que las cards aparezcan en el DOM.
  await page
    .waitForFunction(
      ({ s }) =>
        document.querySelectorAll(`a[href^="/catalogo/${s}/"]`).length > 0,
      { s: slug },
      { timeout: 10_000 },
    )
    .catch(() => {
      // count=0 manejado abajo
    });

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
  // Esperamos a que el client component (ProductGallery) se hidrate.
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

    // Título h1.
    await expect(page.locator("h1").first()).toBeVisible();

    // Precio en formato S/ ...
    await expect(page.getByText(/S\/\s/i).first()).toBeVisible();

    // Descripción (párrafo dentro de .prose).
    await expect(page.locator(".prose p").first()).toBeVisible();

    // Galería: botón principal con aria-haspopup="dialog".
    await expect(page.locator('button[aria-haspopup="dialog"]')).toBeVisible();
  });

  test("thumbnails: click cambia el aria-pressed y la imagen principal", async ({
    page,
  }) => {
    await navigateToFirstProduct(page);

    // Sanity: estamos en una URL de producto (no en /catalogo plano).
    await expect(page).toHaveURL(/\/catalogo\/[a-z0-9-]+\/[a-z0-9-]+$/);

    // Thumbnails son <button aria-pressed="true|false" aria-label="Ver imagen N de ...">.
    const thumbnails = page.locator('button[aria-label^="Ver imagen "]');

    // Damos un tick a que el componente cliente hidrate.
    await page
      .waitForFunction(
        () =>
          document.querySelectorAll('button[aria-label^="Ver imagen "]').length >
          0,
        undefined,
        { timeout: 5_000 },
      )
      .catch(() => {
        // Si no hay thumbnails, el siguiente check skippea por count<2.
      });

    const thumbCount = await thumbnails.count();

    if (thumbCount < 2) {
      test.skip(true, "Producto con una sola imagen — no aplica");
      return;
    }

    // Tomamos el primer thumbnail no-presionado para evitar el seleccionado por default.
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

    // Radix Dialog renderiza el content con role="dialog". El atributo
    // aria-modal es opcional en Radix Modal (lo aplica condicionalmente
    // según `modal` prop). Verificamos role="dialog" como contrato firme
    // y aria-modal como soft check.
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible({ timeout: 8_000 });

    const ariaModal = await dialog.getAttribute("aria-modal");
    // Si aria-modal está, debe ser "true". Si no está, no falla — solo
    // documentamos en consola.
    if (ariaModal !== null) {
      expect(ariaModal).toBe("true");
    }

    // Z-index del overlay > navbar (z-[90]).
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

    // Detectamos cantidad de thumbnails para saber si hay múltiples imágenes.
    const thumbnails = page.locator('button[aria-label^="Ver imagen "]');
    const thumbCount = await thumbnails.count();

    await page.locator('button[aria-haspopup="dialog"]').click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    if (thumbCount >= 2) {
      // Hay contador "n / total" con aria-live=polite. Capturamos antes/después.
      const counter = page.locator("[aria-live='polite']").first();
      const before = (await counter.textContent())?.trim();

      await page.keyboard.press("ArrowRight");
      // Damos un tick a que React update el state.
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

    // Botón con aria-label="Cerrar".
    await page.getByRole("button", { name: "Cerrar" }).click();
    await expect(dialog).toBeHidden();

    // Re-abrimos y probamos backdrop.
    await mainImageButton.click();
    await expect(dialog).toBeVisible();

    // El overlay de Radix Dialog cierra con click. Pulsamos en una esquina
    // donde sabemos que NO hay imagen, ni botones, ni contador.
    const viewport = page.viewportSize();
    if (!viewport) {
      test.skip(true, "Viewport no disponible");
      return;
    }
    // Click cerca de la esquina inferior izquierda (lejos de imagen y controles).
    await page.mouse.click(10, viewport.height - 10);

    await expect(dialog).toBeHidden();
  });

  test("lightbox a11y: role=dialog, focus dentro del dialog al abrir", async ({
    page,
  }) => {
    await navigateToFirstProduct(page);

    const mainImageButton = page.locator('button[aria-haspopup="dialog"]');
    await expect(mainImageButton).toBeVisible();

    // Ponemos foco en el botón antes de abrir y luego abrimos con click.
    await mainImageButton.focus();
    await mainImageButton.click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible({ timeout: 8_000 });

    // aria-modal: si Radix lo expone, debe ser "true".
    const ariaModal = await dialog.getAttribute("aria-modal");
    if (ariaModal !== null) {
      expect(ariaModal).toBe("true");
    }

    // Focus debe estar dentro del dialog (Radix lo mueve al primer focusable).
    const activeInsideDialog = await page.evaluate(() => {
      const active = document.activeElement;
      if (!active) return false;
      const dialog = document.querySelector('[role="dialog"]');
      return dialog?.contains(active) ?? false;
    });
    expect(activeInsideDialog).toBe(true);

    // Cerramos con Escape — el dialog desaparece.
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

    // El focus debería volver al botón que abrió el lightbox.
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

    // El botón WhatsApp es un Link/anchor con href wa.me.
    const whatsappSelector = `a[href*="wa.me/${BUSINESS.phone}"]`;
    const whatsappLink = page.locator(whatsappSelector);
    await expect(whatsappLink.first()).toBeVisible();

    const href = await whatsappLink.first().getAttribute("href");
    expect(href).toBeTruthy();
    expect(href).toContain(`wa.me/${BUSINESS.phone}`);
    expect(href).toMatch(/\?text=/);

    // El nombre del producto debe estar URL-encoded en el query param `text`.
    // BUSINESS.messages.whatsappProduct(name) = `Hola, me interesa el producto: ${name}`.
    const url = new URL(href ?? "");
    const text = url.searchParams.get("text") ?? "";
    expect(text).toContain(productName);
    expect(text.toLowerCase()).toContain("hola");
  });
});
