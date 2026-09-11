import { expect,test } from "@playwright/test";

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

    await expect(page.locator('label[for="email"]')).toBeVisible();
    await expect(page.locator('label[for="password"]')).toBeVisible();
  });

  test("a11y: tab order — email → password → submit", async ({ page }) => {
    await page.goto("/login");

    await page.locator("#email").focus();
    expect(await page.evaluate(() => document.activeElement?.id)).toBe("email");

    await page.keyboard.press("Tab");
    expect(await page.evaluate(() => document.activeElement?.id)).toBe(
      "password",
    );

    await page.keyboard.press("Tab");
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

    await expect(page).toHaveURL(/\/login$/);
    const customError = page.getByText(/credenciales incorrectas/i);
    await expect(customError).toBeHidden();

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

    const errorMsg = page.getByText(/credenciales incorrectas/i);
    await expect(errorMsg).toBeVisible({ timeout: 15_000 });

    const text = (await errorMsg.textContent())?.toLowerCase() ?? "";
    expect(text).not.toContain("test@example.com");
    expect(text).not.toMatch(/no existe/);
    expect(text).not.toMatch(/no encontrado/);
    expect(text).not.toMatch(/usuario inválido/);
    expect(text).not.toMatch(/email no/);

    await expect(page).toHaveURL(/\/login$/);
  });
});
