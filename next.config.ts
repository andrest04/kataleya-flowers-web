import type { NextConfig } from "next";

/**
 * Headers de seguridad estáticos aplicados a todas las rutas.
 *
 * - HSTS: fuerza HTTPS por 2 años incluyendo subdominios. `preload` exige cumplir
 *   con los requisitos de hstspreload.org antes de enviar el sitio al preload list.
 * - X-Frame-Options DENY: prohíbe que cualquier sitio embeba Kataleya en un
 *   iframe (clickjacking). Aplica al sitio siendo embebido, NO afecta el iframe
 *   de Google Maps que el sitio renderiza dentro de /contacto.
 * - X-Content-Type-Options nosniff: evita que el browser adivine MIME types.
 * - Referrer-Policy: envía el origen completo solo en requests same-origin;
 *   en cross-origin solo el origen y solo bajo HTTPS->HTTPS.
 * - Permissions-Policy: deshabilita explícitamente APIs sensibles que el sitio
 *   no usa (camera, microphone, geolocation) y opt-out de FLoC/Topics.
 */
const SECURITY_HEADERS = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), interest-cohort=(), browsing-topics=()",
  },
];

/**
 * Content-Security-Policy en modo Report-Only (Fase 1 de remediación).
 *
 * El browser NO bloquea recursos que violen esta política, pero sí reportará
 * violaciones a la consola del browser (y a un endpoint si se configura
 * `report-uri` / `report-to`). Esto permite detectar problemas reales en
 * producción sin riesgo de romper el sitio.
 *
 * TODO Fase 4: migrar a CSP estricto (header `Content-Security-Policy`):
 *   - generar nonce por request en middleware y propagarlo a `<Script nonce>`
 *   - quitar `'unsafe-inline'` de `script-src` y reemplazar por `'nonce-...'`
 *   - quitar `'unsafe-eval'` (verificar que ningún dep lo necesite en runtime)
 *   - endurecer `style-src` (requiere alinear Tailwind v4 + Framer Motion con nonce)
 *   - definir `report-to` apuntando a un endpoint propio (ej: /api/csp-report) o
 *     a un servicio externo (Sentry, report-uri.com)
 *
 * Dominios permitidos:
 *   - nyc.cloud.appwrite.io -> Appwrite Storage (imágenes de productos/categorías)
 *   - www.google.com        -> iframe de Google Maps en la sección de contacto
 *   - va.vercel-scripts.com -> @vercel/analytics y @vercel/speed-insights
 *
 * Appwrite DB/Auth se consume server-side (RSC + server actions); Storage sí
 * se sirve al browser (URLs de imagen en `<Image>`), de ahí la entrada en
 * img-src.
 */
const CSP_REPORT_ONLY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://nyc.cloud.appwrite.io",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-src 'self' https://www.google.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          ...SECURITY_HEADERS,
          {
            key: "Content-Security-Policy-Report-Only",
            value: CSP_REPORT_ONLY,
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/admin/dashboard",
        destination: "/admin",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
