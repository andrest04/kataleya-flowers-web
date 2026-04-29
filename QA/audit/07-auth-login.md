# Auditoría: Auth `/login` (Supabase Auth)

**Ruta:** `src/app/(auth)/login/page.tsx`
**URL analizada:** `<PRODUCTION_URL>/login` _(auditoría centrada en seguridad — PSI omitido por instrucción del usuario)_
**Fecha:** 2026-04-29
**Archivos analizados:** 8
**Stack:** Next.js 16.2.4 · React 19.2.3 · TS 5 strict · Tailwind v4 · Supabase SSR · Supabase Auth

## Alcance del slice

| # | Archivo | LOC | Rol |
|---|---------|----:|-----|
| 1 | `src/app/(auth)/login/page.tsx` | 126 | Form de login (client component) |
| 2 | `src/lib/supabase/client.ts` | 15 | Browser client (anon key) |
| 3 | `src/lib/supabase/server.ts` | 33 | Server client SSR (cookies) |
| 4 | `src/lib/supabase/middleware.ts` | 35 | Helper proxy/middleware (Next 16 → `proxy.ts`) |
| 5 | `src/lib/supabase/types.ts` | 287 | Tipos de DB (manual, ver §Notas) |
| 6 | `proxy.ts` (root) | 26 | Protección de rutas `/admin/**` y `/login` |
| 7 | `src/app/(admin)/layout.tsx` | 25 | Guard server-side de `/admin/**` |
| 8 | `src/features/admin/components/LogoutButton.tsx` | 25 | Cierra sesión client-side |

**No existen** en este slice (hallazgos por ausencia, ver §Importantes):
- `src/app/(auth)/layout.tsx` — no hay layout dedicado al route group
- `src/app/(auth)/login/loading.tsx` — sin loading UI
- `src/app/(auth)/login/error.tsx` — sin error boundary
- `middleware.ts` en root — correcto: Next 16 renombró a `proxy.ts` ([referencia](https://nextjs.org/docs/messages/middleware-to-proxy))

## Verificación de variables de entorno

- `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` se usan correctamente como **anon key públicas**.
- **Service role key NO está presente** en `src/` (grep negativo sobre `SUPABASE_SERVICE_ROLE`/`SERVICE_ROLE`). Bien.
- Ambos clientes (`client.ts`, `server.ts`, `middleware.ts`) validan presencia de envs en module-load y lanzan error si faltan. Bien.
- El archivo `.env` está fuera de los permisos de lectura del agente — no se pudo verificar contenido, pero sí que no aparezca expuesto en `src/`.

## Verificación de cookies (SSR helper)

`src/lib/supabase/server.ts` y `src/lib/supabase/middleware.ts` usan `@supabase/ssr` con `getAll`/`setAll` — patrón oficial recomendado por Supabase para Next 16. **No se setean opciones manuales** de cookie (httpOnly, Secure, SameSite); las define `@supabase/ssr` internamente: por defecto las cookies de auth son `HttpOnly`, `Secure` (en HTTPS) y `SameSite=Lax`, lo cual es razonable para login con redirect post-auth. Bien — pero ver §Recomendación 🟢 sobre auditoría manual en producción.

## Verificación de protección de rutas admin

Defensa **en dos capas**:

1. **`proxy.ts` (root, Next 16)** — `matcher: ['/admin/:path*', '/login']`:
   - `/admin/**` sin sesión → redirect a `/login` ✅
   - `/login` con sesión → redirect a `/admin` ✅
   - Refresca cookies de sesión vía `supabase.auth.getUser()` ✅
2. **`(admin)/layout.tsx`** — re-verifica con `auth.getUser()` y redirige a `/login` si no hay user. ✅

`auth.getUser()` (no `getSession()`) se usa **en ambos puntos server-side** — esto fuerza verificación contra Supabase Auth Server (no confía solo en la cookie cifrada). Bien.

## Verificación de logout

`LogoutButton.tsx` llama `supabase.auth.signOut()` desde el browser client + `router.push('/login')` + `router.refresh()`. **El `signOut` por defecto usa scope `'global'`**, que invalida todas las sesiones del usuario en todos los devices y elimina la cookie. Bien.

---

## Puntaje (código, énfasis en seguridad)

| Aspecto | Puntaje |
|---------|--------:|
| Responsabilidad única | 90/100 |
| Longitud de archivo | 90/100 |
| **Seguridad** | **78/100** |
| SEO | 85/100 |
| UI / UX | 70/100 |
| Reutilización | 75/100 |
| Separación de capas | 95/100 |
| Tipado | 95/100 |
| Mantenibilidad | 88/100 |
| Escalabilidad | 90/100 |
| **Promedio general** | **85,6/100** |

Seguridad pondera más en este slice: los puntos descontados están en §Riesgos de seguridad priorizados.

## Archivos > 100 líneas

- `src/lib/supabase/types.ts` — 287 líneas (auto-generado, **no se penaliza** la longitud por convención del proyecto).
- `src/app/(auth)/login/page.tsx` — 126 líneas (mezcla form, estilos inline y submit handler — fragmentable, ver §Importantes).

---

## Hallazgos críticos 🔴

### `src/lib/supabase/types.ts` — Tipos posiblemente desactualizados
- **Problema:** Hay un comentario `// Auto-generated — do not edit manually` pero el archivo está **escrito manualmente**: solo expone `Database` con tablas/funciones del dominio, **no incluye el schema `auth`** ni tipos generados por la CLI de Supabase. La discrepancia entre el comentario y la realidad es trampa para futuros mantenedores: alguien puede correr `npm run db:types` (que sobreescribe el archivo) y romper imports. Además, regenerar con la CLI **no incluye `auth`** por default — pero al sobreescribir se pierden los tipos manuales actuales.
- **Línea(s):** 1-2 (comentario engañoso) y todo el archivo.
- **Solución:** o bien (a) cambiar el comentario a `// Manually maintained — see comment in package.json#db:types before regenerating` y documentar el merge manual posterior, o (b) regenerar con CLI y mantener un archivo aparte para los tipos custom. Riesgo medio-alto si se ejecuta `npm run db:types` sin advertencia.

### `src/app/(auth)/login/page.tsx` — No valida ni respeta `redirect`/`next` param
- **Problema:** El submit hace `router.push('/admin')` hardcodeado. Si el usuario llegó a `/login?redirect=/admin/productos/123`, lo manda igual a `/admin`. Esto **no es un open-redirect** (porque el destino es fijo), pero rompe UX y, si en el futuro alguien lee el param sin validar, abre un open-redirect real. **Hoy no hay vulnerabilidad — pero es deuda crítica**.
- **Línea(s):** 32 (`router.push('/admin')`).
- **Solución:** leer `useSearchParams().get('redirect')`, y solo redirigir si el path matchea `^/admin(/.*)?$` (whitelist regex). Cualquier otro valor → fallback a `/admin`. Nunca pasar `redirect` a `router.push` sin validación.

---

## Hallazgos importantes 🟡

### `src/app/(auth)/login/page.tsx` — Mensaje de error genérico OK, pero no diferencia errores de red
- **Problema:** Todo error de `signInWithPassword` se mapea a `'Credenciales incorrectas. Intentá de nuevo.'`. Para credenciales bien — evita user enumeration. Pero un fallo de red, un Supabase down, o un rate-limit (`429`) muestran el mismo mensaje, lo que confunde al admin legítimo y le hace escribir mal el password tres veces.
- **Línea(s):** 26-30.
- **Solución:** narrowing por `authError.status` (Supabase devuelve `400` para credenciales, `429` para rate-limit, `5xx` para servidor). Mensaje genérico solo para 400; para el resto: "Hubo un problema. Intentá en unos minutos." Sin filtrar el `message` raw.

### `src/app/(auth)/login/page.tsx` — Sin a11y: error no anunciado
- **Problema:** El `<p>` de error en línea 110-112 no tiene `role="alert"` ni `aria-live="polite"`, ni los inputs `aria-describedby` que apunte a él. Un lector de pantalla no detecta el cambio. Tampoco hay `aria-invalid` en los inputs cuando hay error.
- **Línea(s):** 70-83 (email), 94-107 (password), 110-112 (error).
- **Solución:** envolver el error en `<p role="alert" id="login-error" ...>`, agregar `aria-describedby="login-error"` y `aria-invalid={!!error}` a ambos inputs cuando `error` esté activo.

### `src/app/(auth)/login/page.tsx` — 126 líneas mezclando form, estilos inline y submit handler
- **Problema:** Estilos inline `style={{...}}` repetidos 6 veces (cada input + form + button). El submit handler vive junto al JSX. El archivo viola SRP suave.
- **Línea(s):** 36-125.
- **Solución:** extraer `LoginForm.tsx` (form puro) + `useLogin.ts` (hook con state + submit). Mover los estilos a clases utilitarias o a `globals.css` si son reutilizables (mismo patrón aparece en otros forms del admin). Mantiene el `page.tsx` < 50 líneas.

### `src/app/(auth)/login/page.tsx` — Sin `metadata` exportada
- **Problema:** No hay `export const metadata` ni `generateMetadata`. La página `/login` hereda solo el title default del root layout (`'Kataleya Flawers'`). En SEO no es grave (login no debe indexarse), pero **debería tener `robots: { index: false, follow: false }`** para evitar que aparezca en SERP. Hoy queda crawleable.
- **Línea(s):** 1-7.
- **Solución:** agregar `export const metadata: Metadata = { title: 'Ingresar', robots: { index: false, follow: false } };` al tope del archivo. Como es client component, `metadata` debe ir en un layout server o convertir el archivo a wrapper server con un `LoginForm` client.

### Falta `src/app/(auth)/layout.tsx`
- **Problema:** Route group `(auth)` no tiene layout propio. La consecuencia: la página `/login` recibe el `RootLayout` que incluye `<Toaster />`, `<Analytics />`, `<SpeedInsights />` y el JSON-LD de `Florist`. Eso está bien — pero **no hay forma de poner `metadata` con `robots: noindex` específico para el grupo auth** sin tocar el page client. Un layout server-side resolvería el hallazgo previo y el a11y de focus management cuando se navegue al grupo.
- **Solución:** crear `src/app/(auth)/layout.tsx` server-side con `metadata.robots.noindex` y un wrapper neutro (`{children}`).

### Falta `loading.tsx` y `error.tsx` para `/login`
- **Problema:** Si `proxy.ts` redirige a `/login` mientras Supabase está lento, no hay UI de loading. Si el bundle de la página falla, no hay error boundary — el usuario ve la pantalla blanca de Next default.
- **Solución:** agregar `src/app/(auth)/login/loading.tsx` con un spinner simple y `error.tsx` con `'use client'` y reset.

### `src/lib/supabase/middleware.ts` — `getUser()` se llama pero no se usa el `user` para nada
- **Problema:** `proxy.ts` (root) llama `supabase.auth.getUser()` para refrescar la cookie. Bien. Pero el helper `src/lib/supabase/middleware.ts` está duplicando setup que también vive en `server.ts` — la diferencia es que el de middleware setea cookies en `request` y `response` para que el proxy las propague. La duplicación es necesaria por el contrato de Next 16 — pero **no está documentada**. Otro dev podría intentar consolidar y romper la propagación de cookies.
- **Línea(s):** 14-35.
- **Solución:** comentario en cabecera explicando "este helper SOLO se usa desde `proxy.ts` — no consolidar con `server.ts` porque firma de cookies es distinta".

### `src/app/(admin)/layout.tsx` — Doble verificación pero sin caching
- **Problema:** `proxy.ts` ya verificó la sesión, y `(admin)/layout.tsx` la re-verifica con otro `getUser()`. Cada navegación a `/admin/**` hace **dos round-trips** a Supabase Auth Server. La doble defensa es correcta — pero `getUser()` en el layout se podría reemplazar por lectura de la cookie ya validada por el proxy, o usar `React.cache()` para deduplicar dentro del mismo request.
- **Línea(s):** 10-17.
- **Solución:** envolver el `createClient()` + `getUser()` en `cache()` de React (`import { cache } from 'react'`) para reusar la respuesta dentro del mismo render. Bajo costo, alto beneficio.

### `LogoutButton.tsx` — `signOut` no maneja error
- **Problema:** `await supabase.auth.signOut()` puede fallar (red, server). Hoy se ignora — el botón redirige igual a `/login`, lo que da impresión de "deslogueado" pero la sesión sigue válida en Supabase. Riesgo bajo (cookie local se borra), pero sin feedback al usuario si algo falla.
- **Línea(s):** 11.
- **Solución:** `const { error } = await supabase.auth.signOut(); if (error) toast.error('No pudimos cerrar la sesión completamente.')`. Ya hay `Toaster` en root layout.

---

## Mejoras propuestas 🟢

### `src/app/(auth)/login/page.tsx` — Sin protección anti-CSRF explícita
- **Propuesta:** Supabase Auth maneja sus propios tokens en cookies SameSite=Lax — eso mitiga CSRF para login. No se necesita CSRF token adicional. Documentar este hecho con un comentario en el page para que un futuro reviewer no agregue protecciones redundantes.

### `src/app/(auth)/login/page.tsx` — Sin trim de email
- **Propuesta:** `email: email.trim().toLowerCase()` antes de mandar a Supabase. Evita falsos negativos por espacios al pegar el email desde un password manager.

### Rate limiting documentado
- **Propuesta:** Supabase Auth tiene rate limit built-in (30 req/hr/IP por default en el endpoint de password sign-in). Agregar nota en `CLAUDE.md` sección Auth indicando ese límite — hoy no está documentado y un dev podría intentar agregar throttling client-side innecesario.

### Cookie audit en producción
- **Propuesta:** Una vez en producción HTTPS, abrir DevTools → Application → Cookies y verificar que las cookies `sb-*` tienen los flags `HttpOnly`, `Secure`, `SameSite=Lax`. Documentar resultado en `QA/`. (No hay forma de auditarlo desde el código sin una request real.)

### `client.ts` y `server.ts` — Validación de envs duplicada
- **Propuesta:** extraer la validación de envs a `src/lib/supabase/env.ts` y reusar. Hoy son 4 líneas duplicadas en 3 archivos (client, server, middleware). Bajo impacto, alta consistencia.

### Honeypot opcional
- **Propuesta:** Como `/login` es indexable hoy (ver hallazgo), agregar un input honeypot oculto (`<input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" />`) — bots de credential stuffing lo llenan, humanos no. Solo tiene sentido si se decide no agregar `noindex`.

### Tests Playwright para auth
- **Propuesta:** No hay tests e2e para el flow de login en `tests/`. Recomendado: (1) login con creds inválidas → mensaje de error; (2) login OK → redirect a `/admin`; (3) acceso directo a `/admin/productos` sin sesión → redirect a `/login`; (4) logout → cookie limpiada y `/admin` redirige.

---

## Riesgos de seguridad priorizados (TOP 5)

| # | Severidad | Riesgo | Impacto | Recomendación |
|---|-----------|--------|---------|---------------|
| 1 | 🔴 Crítico (deuda) | **Redirect post-login hardcodeado a `/admin`** sin lectura de `?redirect=`. Hoy NO es vulnerable — pero la siguiente refactor que lea ese param sin validar abre un **open redirect** clásico (phishing usando `kataleyaflawers.com/login?redirect=https://evil.com`). | Phishing dirigido a admins legítimos. | Implementar lectura+whitelist (regex `^/admin(/.*)?$`) **ahora**, antes de que alguien agregue el param sin validación. Test e2e que confirme rechazo de URLs externas. |
| 2 | 🔴 Crítico (mantenibilidad) | **`types.ts` con comentario "auto-generated" pero contenido manual**. `npm run db:types` lo sobreescribe y los imports siguen compilando porque el comando devuelve un `Database` con menos tablas — pero los tipos manuales se pierden. | Romper Server Actions y queries silenciosamente, exponer datos por tipos `any` implícitos en runtime. | Resolver el comentario engañoso. Decidir entre regenerar con CLI o mantener manualmente — y dejarlo explícito en cabecera. |
| 3 | 🟡 Importante | **`/login` indexable** sin `robots: noindex`. La URL aparece en buscadores → más superficie para credential stuffing y reconocimiento de la app. | Bots descubren el endpoint, scaneo automatizado. | Agregar `metadata.robots = { index: false, follow: false }` vía un `(auth)/layout.tsx` server-side. |
| 4 | 🟡 Importante | **Mensaje de error único para todos los errores de auth**. Mata el debug del admin legítimo cuando hay rate limit (429) o caída de Supabase (5xx). El admin reintenta y dispara más rate limit. | Lockout del admin, escalada de incidente. | Narrowing por `authError.status` con mensajes diferentes (sin leak): "credenciales incorrectas" (400), "demasiados intentos" (429), "servicio no disponible" (5xx). |
| 5 | 🟡 Importante | **Logout silencioso ante error**. Si `signOut()` falla, el redirect a `/login` da falsa sensación de logout — la sesión sigue activa server-side hasta que expire. | Sesión persistente sin que el admin lo sepa (ej: laptop prestada). | Manejar el error con `toast.error` y NO redirigir si falla, o forzar `signOut({ scope: 'global' })` con retry. |

### Lo que SÍ está bien (no descontar puntos)

- ✅ Service role key NO está en cliente (grep negativo).
- ✅ `NEXT_PUBLIC_*` solo expone URL + anon key (correcto).
- ✅ `proxy.ts` protege `/admin/**` y previene loop de login con sesión activa.
- ✅ Doble verificación de sesión (proxy + admin layout).
- ✅ Uso de `auth.getUser()` (no `getSession()`) en server-side — fuerza verificación contra Auth Server.
- ✅ `signOut()` con scope global por default.
- ✅ Inputs con `type="email"`/`type="password"` y `autoComplete` correctos (`email`, `current-password`).
- ✅ Botón submit deshabilitado durante request (`disabled={loading}`).
- ✅ Sin `console.log` de password (grep negativo).
- ✅ Sin `<img>` nativo, sin colores hardcodeados, sin `any` en TS — reglas duras del proyecto OK en este slice.
- ✅ Cero violaciones nuevas en el baseline ESLint para los archivos de este slice.

## Notas finales

- **Next 16 + `proxy.ts`:** confirmado por documentación oficial de Vercel ([nextjs.org/docs/messages/middleware-to-proxy](https://nextjs.org/docs/messages/middleware-to-proxy)) — `middleware.ts` se renombró a `proxy.ts` y la función a `proxy`. La config (`matcher`) se mantiene. **No es un bug del proyecto** — es la convención correcta para Next 16.2.4.
- **Cookies:** `@supabase/ssr` setea `HttpOnly`, `Secure`, `SameSite=Lax` por default — verificar manualmente en DevTools en producción HTTPS.
- **Rate limit:** Supabase Auth limita password sign-in a 30 req/hr/IP por default — suficiente para un panel admin, no requiere throttle adicional.
