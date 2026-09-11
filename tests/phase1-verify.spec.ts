import { expect, type Page,test } from "@playwright/test";

const SCREENSHOT_DIR = "QA/screenshots/phase1";

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

test.describe("Phase 1 — A) Root metadata + fonts", () => {
  test("html lang=es-PE y title default contiene Kataleya Flowers", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "es-PE");
    await expect(page).toHaveTitle(/Kataleya Flowers/);
  });

  test("title template '%s | Kataleya Flowers' aplica en páginas hijas", async ({
    page,
  }) => {
    await page.goto("/catalogo");
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
    expect(title).toMatch(/Kataleya Flowers/);
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
    ).toHaveAttribute("content", "Kataleya Flowers");

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

    const htmlClass = await page.locator("html").getAttribute("class");
    expect(htmlClass).toBeTruthy();
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

    const html = await page.content();
    expect(html).not.toContain("fonts.googleapis.com");
  });
});

test.describe("Phase 1 — B) File-Based Metadata API", () => {
  test("GET /sitemap.xml -> 200, XML, contiene rutas esperadas y excluye admin/api/login", async ({
    request,
  }) => {
    const response = await request.get("/sitemap.xml");
    expect(response.status()).toBe(200);

    const contentType = response.headers()["content-type"] ?? "";
    expect(contentType.toLowerCase()).toContain("xml");

    const body = await response.text();

    expect(body).toContain("kataleya-flawers.appwrite.network/</loc>");
    expect(body).toContain("kataleya-flawers.appwrite.network/catalogo</loc>");

    const categoryMatches = body.match(
      /<loc>https?:\/\/[^<]+\/catalogo\/[^/<]+<\/loc>/g,
    );
    expect(categoryMatches, "sitemap debe contener al menos una categoría")
      .not.toBeNull();
    expect((categoryMatches ?? []).length).toBeGreaterThan(0);

    const productMatches = body.match(
      /<loc>https?:\/\/[^<]+\/catalogo\/[^/<]+\/[^/<]+<\/loc>/g,
    );
    expect(
      productMatches,
      "sitemap debe contener al menos un producto",
    ).not.toBeNull();
    expect((productMatches ?? []).length).toBeGreaterThan(0);

    expect(body).not.toMatch(/\/admin\//);
    expect(body).not.toMatch(/\/api\//);
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
    expect(json.name).toBe("Kataleya Flowers");
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

    const cspReportOnly = headers["content-security-policy-report-only"];
    expect(cspReportOnly).toBeTruthy();

    expect(headers["content-security-policy"]).toBeUndefined();

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

test.describe("Phase 1 — E) Smoke + screenshots", () => {
  test("/ carga sin console.error y captura screenshot", async ({ page }) => {
    const errors = await collectConsoleErrors(page);
    await page.goto("/", { waitUntil: "networkidle" });

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
