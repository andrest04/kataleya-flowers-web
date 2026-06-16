import { expect,test } from "@playwright/test";

/**
 * Phase 4B — Auth público (login form)
 *
 * NO usa credenciales reales. Valida:
 *  - Render de form con email/password + botón submit
 *  - A11y: labels asociados, navegación con Tab
 *  - Submit con email inválido → validación native del browser
 *  - Submit con creds inválidos → mensaje genérico (sin filtración)
 *
 * El login completo (con creds reales) es responsabilidad de Agent 4C.
 */

test.describe("Phase 4B — Auth flow (login form)", () => {
  test("/login renderiza form con email, password y botón submit", async ({
    page,
  }) => {
    await page.goto("/login");

    await expect(page.locator("form")).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();

    const submit = page.getByRole("button", { name: /ingresar/i });
    await expect(submit).toBeVisible();
    // El botón se renderiza enabled hasta que se hace submit (loading=true lo deshabilita).
    await expect(submit).toBeEnabled();
  });

  test("a11y: inputs tienen <label> asociados y autocomplete correcto", async ({
    page,
  }) => {
    await page.goto("/login");

    const emailInput = page.locator("#email");
    const passwordInput = page.locator("#password");

    await expect(emailInput).toHaveAttribute("type", "email");
    await expect(emailInput).toHaveAttribute("autocomplete", "email");
    await expect(emailInput).toHaveAttribute("required", "");

    await expect(passwordInput).toHaveAttribute("type", "password");
    await expect(passwordInput).toHaveAttribute("autocomplete", "current-password");
    await expect(passwordInput).toHaveAttribute("required", "");

    // Cada input tiene un <label for="..."> asociado.
    await expect(page.locator('label[for="email"]')).toBeVisible();
    await expect(page.locator('label[for="password"]')).toBeVisible();
  });

  test("a11y: tab order — email → password → submit", async ({ page }) => {
    await page.goto("/login");

    // Click en email para tomarlo como punto de partida controlado.
    await page.locator("#email").focus();
    expect(await page.evaluate(() => document.activeElement?.id)).toBe("email");

    await page.keyboard.press("Tab");
    expect(await page.evaluate(() => document.activeElement?.id)).toBe(
      "password",
    );

    await page.keyboard.press("Tab");
    // El siguiente tab focusable debería ser el botón submit.
    const focusedTag = await page.evaluate(() =>
      document.activeElement?.tagName.toLowerCase(),
    );
    expect(focusedTag).toBe("button");
    const focusedType = await page.evaluate(() =>
      document.activeElement?.getAttribute("type"),
    );
    expect(focusedType).toBe("submit");
  });

  test("submit con email inválido: validación nativa bloquea el envío", async ({
    page,
  }) => {
    await page.goto("/login");

    await page.locator("#email").fill("abc");
    await page.locator("#password").fill("whatever");
    await page.getByRole("button", { name: /ingresar/i }).click();

    // El browser bloquea el submit por type="email" + valor sin "@".
    // No salimos de /login y NO se muestra el error custom (que solo aparece
    // tras un intento real de auth).
    await expect(page).toHaveURL(/\/login$/);
    const customError = page.getByText(/credenciales incorrectas/i);
    await expect(customError).toBeHidden();

    // Validación nativa: el input de email es :invalid.
    const isInvalid = await page
      .locator("#email")
      .evaluate((el) => (el as HTMLInputElement).validity.valid === false);
    expect(isInvalid).toBe(true);
  });

  test("submit con creds inválidas: mensaje genérico sin filtración", async ({
    page,
  }) => {
    await page.goto("/login");

    await page.locator("#email").fill("test@example.com");
    await page.locator("#password").fill("wrongpassword");
    await page.getByRole("button", { name: /ingresar/i }).click();

    // Esperamos a que aparezca el error tras la respuesta del backend.
    const errorMsg = page.getByText(/credenciales incorrectas/i);
    await expect(errorMsg).toBeVisible({ timeout: 15_000 });

    // El mensaje es uno solo y NO discrimina entre "usuario no existe"
    // y "password incorrecto". Verificamos que NO menciona el email
    // ni términos como "no existe", "no encontrado", "usuario inválido".
    const text = (await errorMsg.textContent())?.toLowerCase() ?? "";
    expect(text).not.toContain("test@example.com");
    expect(text).not.toMatch(/no existe/);
    expect(text).not.toMatch(/no encontrado/);
    expect(text).not.toMatch(/usuario inválido/);
    expect(text).not.toMatch(/email no/);

    // Sigue en /login.
    await expect(page).toHaveURL(/\/login$/);
  });
});
