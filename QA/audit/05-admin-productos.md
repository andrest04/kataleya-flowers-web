# Auditoría: Admin Productos (CRUD)

**Slice:** `/admin`, `/admin/productos`, `/admin/productos/nuevo`, `/admin/productos/[id]`
**Fecha:** 2026-04-29
**Stack:** Next.js 16 · React 19 · TS strict · Tailwind v4 · Supabase (RLS + RPC) · Cloudinary · @dnd-kit
**Archivos analizados:** 19 (rutas, layout, sidebar, list, table, form, uploader, queries, actions, utils, types, hook, endpoints API, clientes Supabase, helper Cloudinary)
**Auth:** route group `(admin)` con guard server-side en `layout.tsx`

> **PSI / Lighthouse: omitido por diseño.** El slice está detrás de `/login` (Supabase Auth) — Lighthouse contra producción daría puntajes de la pantalla de login, no del CRUD. La auditoría se concentra 100 % en código y seguridad.

---

## Puntaje (código)

| Aspecto | Puntaje | Notas |
|---|---|---|
| Responsabilidad única | 60/100 | `ProductForm.tsx` mezcla 4 dominios (producto + colores CRUD + flowerTypes CRUD + uploader) |
| Longitud de archivo | 35/100 | `ProductForm.tsx` 930 líneas, `ProductTable.tsx` 462, `ImageUploader.tsx` 233 |
| **Seguridad** | **55/100** | Server Actions sin auth-check explícito; `/api/cloudinary/sign` totalmente abierto; sin validación de input ni rate limit |
| SEO | 70/100 | Faltan `metadata.robots: noindex` para rutas auth-gated |
| UI / UX | 80/100 | Buen `loading.tsx` y `error.tsx`; falta foco-visible explícito en inputs custom y `aria-live` para errores |
| Reutilización | 78/100 | Buen uso de `Button`, `EmptyState`, `ConfirmDialog`, `ToggleSwitch`; lógica de pills (color + flower) duplicada al 90 % |
| Separación de capas | 82/100 | Server vs Client correcto; pero `ProductForm` llama directamente a `fetch('/api/admin/...')` desde client en vez de Server Action |
| Tipado | 86/100 | TS strict, sin `any`. Hay `as string[]` y `as { products: ... }` (casts en lugar de narrowing) |
| Mantenibilidad | 65/100 | Muchas variables de estado en el form (≈ 18), keys duplicados (`isPending_`), magic strings (`/admin/tipos-de-flor` revalidate inexistente) |
| Escalabilidad | 70/100 | `getAdminProducts()` sin paginación → no escala. Filtro categoría + búsqueda 100 % client-side |
| **Promedio general** | **68/100** | **Regular — varios críticos de seguridad por resolver** |

---

## Archivos analizados (>100 líneas)

| Archivo | Líneas |
|---|---|
| `src/features/admin/components/ProductForm.tsx` | **930** |
| `src/features/admin/components/ProductTable.tsx` | **462** |
| `src/features/admin/components/ImageUploader.tsx` | 233 |
| `src/features/admin/actions/products.ts` | 224 |
| `src/features/admin/components/ProductListClient.tsx` | 198 |
| `src/app/(admin)/admin/page.tsx` | 151 |
| `src/features/admin/utils/adminFilters.ts` | 150 |
| `src/features/admin/hooks/useImageUpload.ts` | 112 |

---

## Hallazgos críticos 🔴

### 🔴 1. `/api/cloudinary/sign` no valida sesión

**Archivo:** `src/app/api/cloudinary/sign/route.ts:4-40`

**Problema:** El endpoint genera firmas de upload Cloudinary sin validar `supabase.auth.getUser()`. Cualquiera con la URL pública del sitio puede hacer `POST /api/cloudinary/sign`, recibir una firma válida con `api_key`, `timestamp`, `signature` y subir libremente al bucket `productos/`. Esto es un vector directo para flooding del bucket, contenido malicioso (imágenes con metadata, contenido inadecuado) y eventualmente exhausción de cuota de Cloudinary.

Otros endpoints admin (`/api/admin/flower-type-usage`, `/api/admin/product-color-usage`) sí chequean auth — la inconsistencia confirma que es un olvido, no una decisión.

**Solución:**
```ts
// route.ts (POST)
const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();
if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
```
Adicional: limitar `folder` a un allowlist (`['productos', 'categorias']`) para evitar que un atacante autenticado escriba en cualquier carpeta arbitraria del bucket.

---

### 🔴 2. Server Actions sin auth-check explícito (defense-in-depth)

**Archivo:** `src/features/admin/actions/products.ts` (todas las funciones), también en `flowerTypes.ts`, `productColors.ts`

**Problema:** Ninguna de `createProduct`, `updateProduct`, `deleteProduct`, `toggleProductStatus`, `reorderProducts`, `deleteFlowerType`, `renameFlowerType`, `deleteProductColor`, `renameProductColor` valida `auth.getUser()` antes de mutar. Toda la seguridad descansa en RLS de Supabase.

Riesgos concretos:
1. Si una migración deshabilita RLS en `products` (accidente o rollback), las acciones quedan abiertas como API pública.
2. Server Actions son endpoints HTTP POST exponibles desde cualquier origen autenticado a través de la sesión cookie — no hay defense-in-depth.
3. RPC `reorder_products`, `delete_flower_type`, `rename_flower_type`, `delete_product_color`, `rename_product_color` corren con permisos de la función. Si alguna se definió `SECURITY DEFINER` sin chequear `auth.uid()`, queda escalación de privilegios.

**Solución:** Agregar guard en cada Server Action (1-2 líneas):
```ts
const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();
if (!user) return { success: false, error: 'No autorizado' };
```
Idealmente, extraer en `assertAdmin()` reutilizable en `src/features/admin/utils/auth.ts` y verificar también un rol/claim (`user.app_metadata.role === 'admin'`) — hoy cualquier usuario autenticado de Supabase puede mutar.

---

### 🔴 3. Sin validación de input en Server Actions (zod/valibot/manual)

**Archivo:** `src/features/admin/actions/products.ts:72-150`

**Problema:** `createProduct(data: ProductFormData)` y `updateProduct(id, data)` toman lo que llega del cliente y lo pasan directo a `toInsertPayload()` → `supabase.insert()`. No hay:
- Validación de tipos en runtime (TS solo protege en build).
- Validación de límites (`name.length`, `price >= 0`, `images` array máximo, `imageUrl` debe ser URL válida y de `res.cloudinary.com`).
- Sanitización de strings (XSS reflejado vía `description`/`occasion`/`note` cuando se renderice en el catálogo público).
- Verificación de que `category_id` existe.
- Verificación de que `imageUrl` y `images[]` apuntan al CDN configurado (un atacante puede insertar URLs arbitrarias que después se renderizan via `next/image`).

Un actor malicioso (ya autenticado) puede inyectar HTML peligroso si en algún Server Component del catálogo se hace `dangerouslySetInnerHTML` sobre `description` (no lo hace hoy, pero el riesgo queda latente).

**Solución:** Usar zod para schema único compartido entre cliente y servidor:
```ts
const ProductSchema = z.object({
  name: z.string().min(1).max(120),
  price: z.number().min(0),
  imageUrl: z.string().url().refine(u => u.startsWith('https://res.cloudinary.com/')),
  images: z.array(z.string().url()).max(10),
  // ...
});
const parsed = ProductSchema.safeParse(data);
if (!parsed.success) return { success: false, error: 'Datos inválidos' };
```

---

### 🔴 4. `ProductForm.tsx` con 930 líneas — viola SRP severamente

**Archivo:** `src/features/admin/components/ProductForm.tsx` (930 líneas)

**Problema:** Mezcla 4 responsabilidades distintas:
1. Formulario de producto (campos básicos, slug, categoría, precio, etc.).
2. CRUD inline de **colores** (renombrar, eliminar, crear) con su propio estado y llamadas a Server Actions y `fetch` directo a `/api/admin/product-color-usage`.
3. CRUD inline de **tipos de flor** (renombrar, eliminar, crear).
4. Listas dinámicas (`includes`, `priceVariants`).

Resulta:
- 18 `useState` independientes — alto riesgo de bugs por estados inconsistentes.
- Variables como `isPending_` (nombre con underscore para evitar shadow) son síntoma del problema.
- Hace un re-render completo al editar un campo cualquiera.
- Imposible de testear unitariamente.

**Solución:** Extraer a sub-componentes feature-folder:
- `ColorManager.tsx` — pills + gestión inline (renombrar/eliminar/agregar).
- `FlowerTypeManager.tsx` — idéntico patrón al anterior; abstraer en `<TaxonomyManager>` genérico.
- `IncludesField.tsx` — array dinámico de incluye.
- `PriceVariantsField.tsx` — array dinámico de variantes.
- `ProductForm.tsx` queda con < 200 líneas, sólo orquesta.

Adicional: usar `useReducer` o un schema de form (react-hook-form) en lugar de 18 `useState`.

---

### 🔴 5. `ProductTable.tsx` — 462 líneas con dos vistas duplicadas

**Archivo:** `src/features/admin/components/ProductTable.tsx`

**Problema:** Tiene dos render trees casi idénticos (200+ líneas cada uno): el "reorderable" (DnD) y el "standard table". Cada celda (imagen, nombre, slug, categoría, precio, toggle, acciones) está duplicada con leves diferencias de layout. Corregir un bug requiere tocar dos lugares.

**Solución:** Extraer `<ProductRow>` / `<ProductRowReorderable>` reutilizando una `<ProductRowContent>` interna que reciba slots. O directamente: una sola tabla siempre reorderable, con drag handles ocultos cuando `!reorderable`.

---

### 🔴 6. `(category_id)` y `(image_url)` insertados sin verificación de existencia / propiedad

**Archivo:** `src/features/admin/actions/products.ts:51-70` (`toInsertPayload`)

**Problema:** En `createProduct`, `data.categoryId` se inserta tal cual. Si el cliente manda un UUID inexistente, Supabase devolverá un error de FK — pero el mensaje crudo se devuelve al cliente (`error: error.message`), filtrando estructura interna de la DB. Mismo para `imageUrl`/`images` que pueden apuntar a CDNs ajenos.

**Solución:** Validar `category_id` con un `select` previo (o aceptar el error de FK pero mapearlo a un mensaje genérico). Restringir URLs de imagen a `res.cloudinary.com/<CLOUD_NAME>/`.

---

## Hallazgos importantes 🟡

### 🟡 1. Falta `metadata.robots: noindex` en rutas admin

**Archivos:** `src/app/(admin)/layout.tsx`, todas las `page.tsx` admin

**Problema:** Aunque la ruta redirige a `/login`, los robots agresivos pueden indexar URLs vacías o mensajes de redirección. Además, en builds preview (Vercel) podrían quedar expuestas a Google.

**Solución:** En `(admin)/layout.tsx`:
```ts
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};
```

---

### 🟡 2. `images` en `Database['products']['Row']` se castea con `as string[]` (línea 71, 139, 174 de actions y form)

**Archivos:** `src/features/admin/actions/products.ts:139,174`, `src/features/admin/components/ProductForm.tsx:71`

**Problema:** El tipo generado por Supabase para columnas `jsonb` es `Json` (no `string[]`). Castear con `as string[]` evade el sistema de tipos. Si en la DB queda accidentalmente un valor que no es array de string, explota en runtime sin diagnóstico.

**Solución:** Definir un type guard `isStringArray(value: Json): value is string[]` y usarlo en lugar del cast. Mismo principio para `includes` (línea 71 form).

---

### 🟡 3. `revalidatePath('/admin/tipos-de-flor')` sobre ruta inexistente

**Archivos:** `src/features/admin/actions/products.ts:96`, `src/features/admin/actions/flowerTypes.ts:17,38`

**Problema:** Se llama a `revalidatePath('/admin/tipos-de-flor')` pero esa ruta no existe en `src/app/(admin)/admin/`. No causa error pero ensucia el cache invalidator y confunde a quien lo lea.

**Solución:** Eliminar esa línea o crear la ruta si está planificada.

---

### 🟡 4. `getAdminProducts()` no tiene paginación

**Archivo:** `src/features/admin/queries/products.ts:6-15`

**Problema:** Hace `select('*')` sin `.range()` ni `.limit()`. Con 6 categorías y crecimiento del catálogo, hoy quizás son 50-100 productos — manejable. Pero a 500+ productos:
- TTFB de la página crece linealmente.
- El render de `ProductListClient` con `useMemo`/`useState(items)` carga todo en memoria del browser.
- `categoryCounts.set(...)` recorre todos los productos en el cliente.

**Solución:** Implementar paginación server-side con `searchParams` (`?page=1&perPage=50`). El filtro de categoría también debería ser server-side (vía `searchParams`) en lugar de client-side recortando un dataset gigante.

---

### 🟡 5. Filtro de categoría + búsqueda 100 % client-side

**Archivo:** `src/features/admin/components/ProductListClient.tsx:38-58`

**Problema:** Carga todos los productos del backend y filtra en `useMemo`. Bien para un catálogo pequeño (≤ 100). Mal cuando la tienda crezca. Además, el `key={activeCategory?.id ?? 'all'}` en `<ProductTable>` desmonta y remonta el subtree completo cada vez que el usuario cambia de pill — pierde el estado interno del componente (incluyendo el orden modificado en DnD).

**Solución:** Mover el filtro a server-side (la URL ya tiene `?categoria=...`, sólo falta usarla en `getAdminProducts({ categorySlug })`). El remount con `key` es un workaround a la dependencia de `useState(products)` — eliminar ese `useState` y derivar de props directamente, o usar `useEffect` para sincronizar.

---

### 🟡 6. `useImageUpload` valida MIME sólo en cliente

**Archivo:** `src/features/admin/hooks/useImageUpload.ts:27-36`

**Problema:** `file.type.startsWith('image/')` y `file.size > 10MB` se chequean sólo en el browser. Cualquiera que llame directo a Cloudinary con la firma puede subir cualquier archivo (porque el endpoint de firma no restringe `resource_type` ni tipos). Cloudinary por default acepta hasta 10 MB de imágenes, pero un atacante puede romper esto si manipula `formData`.

**Solución:** En `/api/cloudinary/sign`, agregar al firmado:
- `eager_async=true` con transformaciones para validar formato.
- `format=jpg,png,webp` o `allowed_formats` en el preset Cloudinary.
- `max_file_size` en bytes.
Usar **upload presets server-only** (no firmados ad hoc) — se configura una vez, queda inmutable.

---

### 🟡 7. Errores de Supabase exponen mensaje crudo al cliente

**Archivos:** `src/features/admin/actions/products.ts:92,132,170,197,216` y todos los demás `actions/*.ts`

**Problema:** `return { success: false, error: error.message }` filtra mensajes como `"duplicate key value violates unique constraint products_slug_key"` o nombres de columnas internas. No es información sensible inmediata, pero ayuda a un atacante a mapear el schema.

**Solución:** Loguear el `error.message` con un logger server-side (ya hay Vercel) y devolver mensajes genéricos al cliente: `"Ya existe un producto con ese nombre."`, `"No se pudo guardar."`, etc.

---

### 🟡 8. Slugs no garantizan unicidad

**Archivos:** `src/features/admin/utils/slugify.ts`, `src/features/admin/actions/products.ts:85,124`

**Problema:** `slugify("Ramo Rosas Rojas") === slugify("Ramo, rosas — rojas!")`. Si hay constraint UNIQUE en la columna `slug` (lo más probable), el segundo insert falla con un error de FK que termina mostrando el mensaje crudo (ver hallazgo 🟡 7). Si no hay UNIQUE, el catálogo público tendrá slugs duplicados → rutas `/catalogo/[categoria]/[slug]` colisionan y `single()` falla en runtime.

**Solución:** Detectar colisión antes del insert y agregar sufijo: `ramo-rosas-rojas`, `ramo-rosas-rojas-2`. O dejar que la DB falle pero capturar `error.code === '23505'` y mostrar mensaje accionable.

---

### 🟡 9. ProductForm hace `fetch('/api/admin/...')` directo desde client

**Archivo:** `src/features/admin/components/ProductForm.tsx:464,732`

**Problema:** Para chequear el "uso" de un color/tipo antes de borrar, llama a un endpoint REST creado ad-hoc. La separación correcta sería un Server Action `checkColorUsage(name)` que devuelva `{ count }` — más simple, tipado, sin armar/parsear JSON manual y sin necesidad de mantener una ruta API.

**Solución:** Convertir `/api/admin/flower-type-usage` y `/api/admin/product-color-usage` en Server Actions (`getFlowerTypeUsageCount(name)`, `getProductColorUsageCount(name)`).

---

### 🟡 10. Color hex hardcodeado en ProductForm (default `#3b82f6`)

**Archivo:** `src/features/admin/components/ProductForm.tsx:110, 512, 552`

**Problema:** `useState('#3b82f6')` (azul Tailwind) hardcodeado como color por defecto del color picker. La regla del proyecto prohíbe colores hardcodeados en JSX. Aunque acá es un valor inicial de input no estilo, sigue siendo un magic value.

**Solución:** Mover a `src/features/admin/types/index.ts` o un `constants.ts` del feature: `export const DEFAULT_NEW_COLOR_HEX = '#3b82f6';`.

---

### 🟡 11. ProductTable.tsx — manipulación directa del DOM en `onMouseEnter`

**Archivo:** `src/features/admin/components/ProductTable.tsx:381-387`

**Problema:**
```tsx
onMouseEnter={(e) => {
  (e.currentTarget as HTMLTableRowElement).style.background = 'var(--color-surface)';
}}
```
Imperativamente cambia el style del DOM, no es idiomático en React 19, no respeta el modelo declarativo, y se rompe si el row se actualiza por otra razón.

**Solución:** Usar `:hover` en CSS o Tailwind `hover:bg-[var(--color-surface)]`.

---

### 🟡 12. `is_featured` y `display_order` no se exponen en el form

**Archivo:** `src/features/admin/components/ProductForm.tsx:55-58, 73-77`

**Problema:** El estado del form los inicializa pero no hay UI para tocarlos. El admin no puede marcar un producto como destacado desde el formulario — sólo via DB directa o un Server Action separado que no existe. Inconsistencia: el dashboard muestra "destacados sin vistas" pero no hay forma de marcar destacado desde la UI.

**Solución:** Agregar dos campos: `<ToggleSwitch>` para `isFeatured` y `<Input type="number">` para `displayOrder` (o dejar que se gestione por DnD, que ya existe).

---

### 🟡 13. `ProductListClient` usa `<a href>` para limpiar filtro en lugar de `<Link>`

**Archivo:** `src/features/admin/components/ProductListClient.tsx:175-181`

**Problema:** `<a href={clearFilterHref}>` provoca full-page navigation. Debería ser `<Link href={...}>` o `router.replace(clearFilterHref)`.

**Solución:** Cambiar a `import Link from 'next/link'` y `<Link href={clearFilterHref} ...>`.

---

### 🟡 14. `ImageUploader` — `multiple` con `for...of` await secuencial

**Archivo:** `src/features/admin/components/ImageUploader.tsx:48-57`

**Problema:** Sube N imágenes una a una en serie. Para 10 imágenes esto puede tardar 30-60 segundos. Además, si una falla, las siguientes igual se intentan pero el progreso se sobrescribe.

**Solución:** Subir en paralelo con `Promise.allSettled(toUpload.map(f => uploadImage(f, folder)))` y agregar UI de progreso por archivo.

---

### 🟡 15. `useImageUpload` — `progress` global compartido entre uploads

**Archivo:** `src/features/admin/hooks/useImageUpload.ts:21,38-39`

**Problema:** Un solo `progress` para múltiples uploads concurrentes. En modo `multiple` el progreso "salta" entre archivos. UX confusa.

**Solución:** Cambiar a `progress: Map<string, number>` o devolver una promise con su propio canal de progreso.

---

### 🟡 16. AdminSidebar — sin estado activo visual

**Archivo:** `src/features/admin/components/AdminSidebar.tsx:31-42`

**Problema:** El sidebar no resalta la ruta actual. UX deficiente: el admin no sabe en qué sección está.

**Solución:** Usar `usePathname()` (requiere `'use client'`) y aplicar `style={{ background: 'var(--color-surface)' }}` cuando `pathname.startsWith(href)`.

---

## Mejoras propuestas 🟢

### 🟢 1. Optimistic UI inconsistente

`handleToggleStatus` (ProductTable:191) usa optimistic correcto: cambia local → llama action → revierte si falla. Pero `handleDeleteConfirm` (ProductTable:205) hace lo opuesto: espera el resultado y recién filtra. Unificar el patrón hace el código más predecible.

### 🟢 2. Falta `aria-live` en mensajes de error del form

`<FormError message={error} />` se renderiza sin `role="alert"` ni `aria-live="polite"`. Lectores de pantalla no anuncian el error cuando aparece.

### 🟢 3. ConfirmDialog — falta detalle al eliminar

`"¿Eliminar el producto X?"` — añadir cantidad de imágenes que se borrarán en Cloudinary y advertir que es irreversible (la action ya destruye imágenes async, pero el admin no lo sabe).

### 🟢 4. `reorderProducts` recibe array completo de IDs

Para tiendas grandes (200+ productos), enviar 200 UUIDs en cada drag suena pesado. Una alternativa: enviar sólo el id que se movió y el id-anterior (diff). Pero la implementación actual es más simple y robusta — sólo vale si la performance lo justifica.

### 🟢 5. Form reset incompleto en `onSuccess`

`setPendingNewTypes([])` y `setPendingNewColors([])` se limpian, pero no `pendingNewTypes` queda visible si el user vuelve atrás (mediante el browser). Considerar `router.refresh()` antes de `router.push`.

### 🟢 6. `LogoutButton` no muestra estado loading

Click → API call → redirect. Si la red está lenta, el user puede clickear varias veces. Agregar `disabled` durante el `await`.

### 🟢 7. Endpoint de uso de color/tipo: contar con SQL en lugar de devolver array

`getFlowerTypeUsage` devuelve la lista completa de productos. El form sólo usa `data.products.length`. Hacer un `count(*)` en RPC y devolver `{ count: number }` ahorra payload.

### 🟢 8. `slugify` debería ser test-covered

10 líneas, alta superficie de bugs (caracteres unicode, símbolos, números). Buen candidato para un test unitario en `tests/utils/slugify.spec.ts`.

### 🟢 9. Faltan e2e Playwright para CRUD admin

`tests/helpers/adminAuth.ts` existe — pero no hay specs que lo usen. Un test mínimo: login → crear producto → editar → eliminar. Cubre el happy path completo.

---

## Resumen de riesgos de seguridad (priorizados)

| # | Riesgo | Severidad | Impacto | Esfuerzo |
|---|---|---|---|---|
| 1 | `/api/cloudinary/sign` sin auth — upload abierto al CDN | 🔴 ALTO | Flooding del bucket, costo Cloudinary, contenido malicioso | 5 min |
| 2 | Server Actions sin auth-check (defense-in-depth) | 🔴 ALTO | Si RLS falla por accidente, CRUD queda público | 30 min |
| 3 | Sin validación de input (zod) en actions | 🔴 ALTO | XSS reflejado en catálogo público vía description; DoS por payloads grandes | 1-2 h |
| 4 | URLs de imagen sin restricción a CDN configurado | 🟡 MEDIO | Hot-linking a CDNs ajenos, posible SSRF si se renderiza | 15 min |
| 5 | Mensajes de error Supabase crudos al cliente | 🟡 MEDIO | Information disclosure: estructura DB, índices, columnas | 30 min |
| 6 | Sin rate limit en actions (especialmente upload) | 🟡 MEDIO | Spam de productos / colores / categorías; flooding del CDN | 1 h (Upstash o middleware) |
| 7 | Cualquier usuario autenticado en Supabase puede usar el admin | 🟡 MEDIO | No hay role check (`app_metadata.role === 'admin'`) | 1 h |
| 8 | Folder de Cloudinary sin allowlist | 🟢 BAJO | Atacante autenticado escribe en `/cualquier/folder` | 10 min |

**Acción inmediata recomendada:** corregir #1, #2 y #4 antes del próximo deploy a producción. Son cambios pequeños y cierran los vectores más expuestos.

---

## Conclusión

El slice tiene **arquitectura sólida** (feature-folder, server vs client correcto, route group con guard, Server Actions tipadas, RPCs en Supabase). Pero falla en **dos ejes críticos**:

1. **Defense-in-depth de seguridad**: confía 100 % en RLS sin chequear sesión en cada Server Action ni en el endpoint de firma Cloudinary. Una falla de configuración de RLS deja todo abierto.
2. **Mantenibilidad de `ProductForm.tsx`**: 930 líneas haciendo 4 cosas distintas. Es la deuda técnica más cara del slice.

Lo bueno: el patrón de optimistic UI con rollback (toggle status), el uso correcto de `revalidatePath`, la limpieza best-effort de imágenes en Cloudinary tras update/delete, y la separación queries/actions/components. Todo eso vale 70+ puntos de base.

**Promedio: 68/100 — Regular con prioridad alta de seguridad.**
