import { expect, type Page,test } from "@playwright/test";

/**
 * Fase 1 — Regression spec
 *
 * Valida los cambios introducidos en Fase 1:
 *  A) Fonts + root metadata (src/app/layout.tsx, src/app/globals.css)
 *  B) File-Based Metadata API (sitemap, robots, manifest, opengraph-image)
 *  C) Security headers (next.config.ts)
 *  D) ESLint rules — fuera de scope E2E (se valida con `npm run lint`)
 *  E) Smoke tests funcionales — sitio no roto + screenshots
 *
 * Notas:
 *  - El dev server debe estar corriendo en http://localhost:3000.
 *  - Los screenshots quedan en QA/screenshots/phase1/ para visual diff manual.
 */

const SCREENSHOT_DIR = "QA/screenshots/phase1";

// Helpers ---------------------------------------------------------------------

/**
 * Mensajes de error en consola que ignoramos a propósito porque NO son bugs
 * del sitio — son warnings conocidos del browser sobre directivas CSP que
 * Chromium reporta como `console.error` aunque sean meramente informativos.
 *
 * - "upgrade-insecure-requests ... ignored when delivered in a report-only policy"
 *   Esperable: Fase 1 entrega CSP en modo Report-Only y la directiva
 *   `upgrade-insecure-requests` solo aplica al CSP enforced. Documentado en
 *   `next.config.ts` (TODO Fase 4: migrar a CSP enforced).
 */
const IGNORED_CONSOLE_PATTERNS: RegExp[] = [
  /upgrade-insecure-requests.*ignored.*report-only/i,
];

function shouldIgnoreConsoleError(text: string): boolean {
  return IGNORED_CONSOLE_PATTERNS.some((re) => re.test(text));
}

async function collectConsoleErrors(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() !== "error") return;
    const text = msg.text();
    if (shouldIgnoreConsoleError(text)) return;
    errors.push(text);
  });
  page.on("pageerror", (err) => {
    if (shouldIgnoreConsoleError(err.message)) return;
    errors.push(`pageerror: ${err.message}`);
  });
  return errors;
}

// A) Fonts + root metadata ----------------------------------------------------

test.describe("Phase 1 — A) Root metadata + fonts", () => {
  test("html lang=es-PE y title default contiene Kataleya Flawers", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "es-PE");
    await expect(page).toHaveTitle(/Kataleya Flawers/);
  });

  test("title template '%s | Kataleya Flawers' aplica en páginas hijas", async ({
    page,
  }) => {
    await page.goto("/catalogo");
    // El layout define template `%s | Kataleya Flawers` y la página /catalogo
    // setea su propio title (no default), por lo que debe contener el suffix.
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
    expect(title).toMatch(/Kataleya Flawers/);
  });

  test("og:type=website, og:locale=es_PE, og:site_name, og:url, twitter:card", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute(
      "content",
      "website",
    );
    await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute(
      "content",
      "es_PE",
    );
    await expect(
      page.locator('meta[property="og:site_name"]'),
    ).toHaveAttribute("content", "Kataleya Flawers");

    const ogUrl = await page
      .locator('meta[property="og:url"]')
      .getAttribute("content");
    expect(ogUrl).toBeTruthy();
    expect(ogUrl).toContain("kataleya-flawers.appwrite.network");

    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
      "content",
      "summary_large_image",
    );
  });

  test("metadataBase resuelve a https://kataleya-flawers.appwrite.network via og:url y canonical", async ({
    page,
  }) => {
    await page.goto("/");

    const canonical = await page
      .locator('link[rel="canonical"]')
      .getAttribute("href");
    expect(canonical).toBeTruthy();
    expect(canonical).toContain("kataleya-flawers.appwrite.network");
  });

  test("link rel=canonical presente en /", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('link[rel="canonical"]').first()).toHaveCount(1);
  });

  test("NO hay <link rel='icon' href='/favicon.png'> (referencia rota removida)", async ({
    page,
  }) => {
    await page.goto("/");
    const brokenIcons = page.locator('link[rel="icon"][href="/favicon.png"]');
    await expect(brokenIcons).toHaveCount(0);
  });

  test("/favicon.ico responde 200 (auto-inyectado por Next)", async ({
    request,
  }) => {
    const response = await request.get("/favicon.ico");
    expect(response.status()).toBe(200);
  });

  test("next/font: variables --font-heading y --font-body inyectadas, sin @import a fonts.googleapis.com", async ({
    page,
  }) => {
    await page.goto("/");

    // <html> debe tener las clases generadas por next/font con --font-heading
    // y --font-body como CSS variables.
    const htmlClass = await page.locator("html").getAttribute("class");
    expect(htmlClass).toBeTruthy();
    // next/font genera clases tipo `__variable_xxxxxx` y los CSS contienen las
    // custom properties. Verificamos directamente que las variables estén
    // computadas en :root o en <html>.
    const fontHeading = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue(
        "--font-heading",
      ),
    );
    const fontBody = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue(
        "--font-body",
      ),
    );
    expect(fontHeading.trim().length).toBeGreaterThan(0);
    expect(fontBody.trim().length).toBeGreaterThan(0);

    // El HTML server-rendered NO debe contener un @import a Google Fonts —
    // next/font self-hostea las fuentes.
    const html = await page.content();
    expect(html).not.toContain("fonts.googleapis.com");
  });
});

// B) File-Based Metadata API --------------------------------------------------

test.describe("Phase 1 — B) File-Based Metadata API", () => {
  test("GET /sitemap.xml -> 200, XML, contiene rutas esperadas y excluye admin/api/login", async ({
    request,
  }) => {
    const response = await request.get("/sitemap.xml");
    expect(response.status()).toBe(200);

    const contentType = response.headers()["content-type"] ?? "";
    expect(contentType.toLowerCase()).toContain("xml");

    const body = await response.text();

    // Rutas estáticas esperadas (al menos / y /catalogo).
    expect(body).toContain("kataleya-flawers.appwrite.network/</loc>");
    expect(body).toContain("kataleya-flawers.appwrite.network/catalogo</loc>");

    // Al menos UNA categoría (formato /catalogo/{slug}, sin slug adicional).
    // Ejemplo de match: <loc>https://.../catalogo/amor-y-romance</loc>
    const categoryMatches = body.match(
      /<loc>https?:\/\/[^<]+\/catalogo\/[^/<]+<\/loc>/g,
    );
    expect(categoryMatches, "sitemap debe contener al menos una categoría")
      .not.toBeNull();
    expect((categoryMatches ?? []).length).toBeGreaterThan(0);

    // Al menos UN producto (formato /catalogo/{categoria}/{slug}).
    const productMatches = body.match(
      /<loc>https?:\/\/[^<]+\/catalogo\/[^/<]+\/[^/<]+<\/loc>/g,
    );
    expect(
      productMatches,
      "sitemap debe contener al menos un producto",
    ).not.toBeNull();
    expect((productMatches ?? []).length).toBeGreaterThan(0);

    // No debe listar admin ni api.
    expect(body).not.toMatch(/\/admin\//);
    expect(body).not.toMatch(/\/api\//);
    // Nota: /login SÍ se incluye en sitemap.ts actual con priority 0.3.
    // Es una decisión del proyecto (login es público). El test NO falla por esto,
    // solo deja constancia.
  });

  test("GET /robots.txt -> 200, contiene Disallow admin/api/login y referencia a sitemap", async ({
    request,
  }) => {
    const response = await request.get("/robots.txt");
    expect(response.status()).toBe(200);

    const body = await response.text();
    expect(body).toContain("Disallow: /admin/");
    expect(body).toContain("Disallow: /api/");
    expect(body).toMatch(/Disallow:\s*\/login/);
    expect(body).toMatch(/Sitemap:\s*https?:\/\/[^\s]+\/sitemap\.xml/i);
  });

  test("GET /manifest.webmanifest -> 200, JSON con name/short_name/theme_color/background_color", async ({
    request,
  }) => {
    const response = await request.get("/manifest.webmanifest");
    expect(response.status()).toBe(200);

    const contentType = response.headers()["content-type"] ?? "";
    expect(contentType.toLowerCase()).toContain("manifest+json");

    const json = (await response.json()) as {
      name?: string;
      short_name?: string;
      theme_color?: string;
      background_color?: string;
    };
    expect(json.name).toBe("Kataleya Flawers");
    expect(json.short_name).toBeTruthy();
    expect(json.theme_color?.toLowerCase()).toBe("#c0392b");
    expect(json.background_color?.toLowerCase()).toBe("#fdfcfa");
  });

  test("GET /opengraph-image -> 200, content-type image/png", async ({
    request,
  }) => {
    const response = await request.get("/opengraph-image");
    expect(response.status()).toBe(200);

    const contentType = response.headers()["content-type"] ?? "";
    expect(contentType.toLowerCase()).toContain("image/png");

    const buffer = await response.body();
    expect(buffer.byteLength).toBeGreaterThan(0);
  });
});

// C) Security headers ---------------------------------------------------------

test.describe("Phase 1 — C) Security headers en /", () => {
  test("HSTS, X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy", async ({
    request,
  }) => {
    const response = await request.get("/");
    expect(response.status()).toBe(200);
    const headers = response.headers();

    expect(headers["strict-transport-security"]).toBe(
      "max-age=63072000; includeSubDomains; preload",
    );
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["referrer-policy"]).toBe(
      "strict-origin-when-cross-origin",
    );
  });

  test("Permissions-Policy presente con camera/microphone/geolocation deshabilitados", async ({
    request,
  }) => {
    const response = await request.get("/");
    const headers = response.headers();

    const pp = headers["permissions-policy"];
    expect(pp).toBeTruthy();
    expect(pp).toContain("camera=()");
    expect(pp).toContain("microphone=()");
    expect(pp).toContain("geolocation=()");
  });

  test("CSP en Report-Only (no enforced) y permite nyc.cloud.appwrite.io en img-src", async ({
    request,
  }) => {
    const response = await request.get("/");
    const headers = response.headers();

    // Modo Report-Only debe estar presente.
    const cspReportOnly = headers["content-security-policy-report-only"];
    expect(cspReportOnly).toBeTruthy();

    // CSP enforced NO debe estar presente (Fase 1 es solo report-only).
    expect(headers["content-security-policy"]).toBeUndefined();

    // img-src debe permitir nyc.cloud.appwrite.io (Appwrite Storage de productos).
    const imgSrcMatch = (cspReportOnly ?? "").match(/img-src[^;]*/);
    expect(imgSrcMatch, "img-src debe estar definido en CSP").not.toBeNull();
    expect(imgSrcMatch?.[0]).toContain("https://nyc.cloud.appwrite.io");
  });

  test("NO existe X-Powered-By: Next.js (poweredByHeader: false)", async ({
    request,
  }) => {
    const response = await request.get("/");
    const headers = response.headers();
    expect(headers["x-powered-by"]).toBeUndefined();
  });
});

// E) Smoke tests funcionales --------------------------------------------------

test.describe("Phase 1 — E) Smoke + screenshots", () => {
  test("/ carga sin console.error y captura screenshot", async ({ page }) => {
    const errors = await collectConsoleErrors(page);
    await page.goto("/", { waitUntil: "networkidle" });

    // Espera mínima para que terminen efectos client-side.
    await page.waitForLoadState("domcontentloaded");

    await page.screenshot({
      path: `${SCREENSHOT_DIR}/home.png`,
      fullPage: true,
    });

    expect(
      errors,
      `console.error en /: ${JSON.stringify(errors, null, 2)}`,
    ).toEqual([]);
  });

  test("/catalogo carga, tiene contenido visible y captura screenshot", async ({
    page,
  }) => {
    const errors = await collectConsoleErrors(page);
    await page.goto("/catalogo", { waitUntil: "networkidle" });

    await expect(
      page.getByRole("heading", { level: 1, name: "Flores para cada momento" }),
    ).toBeVisible();

    await page.screenshot({
      path: `${SCREENSHOT_DIR}/catalogo.png`,
      fullPage: true,
    });

    expect(
      errors,
      `console.error en /catalogo: ${JSON.stringify(errors, null, 2)}`,
    ).toEqual([]);
  });

  test("/login carga sin errores y captura screenshot", async ({ page }) => {
    const errors = await collectConsoleErrors(page);
    await page.goto("/login", { waitUntil: "networkidle" });

    // El login renderiza al menos un form o un main visible.
    await expect(page.locator("main, form").first()).toBeVisible();

    await page.screenshot({
      path: `${SCREENSHOT_DIR}/login.png`,
      fullPage: true,
    });

    expect(
      errors,
      `console.error en /login: ${JSON.stringify(errors, null, 2)}`,
    ).toEqual([]);
  });
});
