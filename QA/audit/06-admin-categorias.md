# Auditoría: Admin Categorías (`/admin/categorias`)

**Ruta:** `src/app/(admin)/admin/categorias/page.tsx`
**Fecha:** 2026-04-29
**Archivos analizados:** 14 (slice + dependencias directas)
**Stack:** Next.js 16 · React 19 · TS strict · Tailwind v4 · Supabase · Cloudinary · @dnd-kit/react 0.3.2 · @dnd-kit/helpers 0.3.2

> **Nota:** Esta ruta es **auth-gated** — se omite el análisis PageSpeed Insights (no se corre Lighthouse/PSI sobre rutas privadas). Se hace solo auditoría estática de código + chequeos específicos del slice (drag-drop, CRUD, RLS, RPCs).

---

## Archivos auditados

| Archivo | Líneas |
|---------|--------|
| `src/features/admin/components/CategoryList.tsx` | **479** |
| `src/features/admin/actions/categories.ts` | **213** |
| `src/features/admin/components/CategoryForm.tsx` | 148 |
| `src/app/(admin)/admin/categorias/page.tsx` | **107** |
| `src/app/(admin)/admin/categorias/[id]/page.tsx` | 53 |
| `src/app/(admin)/admin/categorias/nueva/page.tsx` | 40 |
| `src/features/admin/types/index.ts` | 33 |
| `src/features/admin/queries/categories.ts` | 27 |
| `src/features/admin/utils/slugify.ts` | 10 |
| `src/features/admin/utils/adminFilters.ts` (parcial — admite categorías) | 151 |
| `src/features/admin/queries/adminFilters.ts` | 28 |
| `proxy.ts` (auth gate Next 16) | 27 |
| `src/app/(admin)/layout.tsx` | 26 |
| `supabase/migrations/20260405000001_category_transaction_rpcs.sql` | 103 |

---

## Puntaje (código)

| Aspecto | Puntaje |
|---------|---------|
| Responsabilidad única | 55/100 |
| Longitud de archivo | 50/100 |
| Seguridad | 55/100 |
| SEO | 90/100 |
| UI / UX | 70/100 |
| Reutilización | 80/100 |
| Separación de capas | 85/100 |
| Tipado | 88/100 |
| Mantenibilidad | 70/100 |
| Escalabilidad | 78/100 |
| **Promedio general** | **72/100** |

> SEO casi no aplica en admin (auth-gated), no se penaliza la falta de metadata pública. El puntaje refleja "no obstaculiza" — no que se esté optimizando para buscadores.

---

## Drag-and-drop — sección destacada (UX/perf)

`CategoryList.tsx` usa la **API moderna de `@dnd-kit/react`** (no la legacy `@dnd-kit/core`). Es la API basada en `<DragDropProvider>` + `useSortable({ id, index })` + helper `move()`. Esto cambia muchas reglas comparadas con la guía clásica de dnd-kit.

### Puntaje drag-drop UX/Perf: **72/100**

### Lo que está bien
- ✅ Handle separado vía `handleRef` — solo el ícono `⠿` inicia drag, no toda la fila. Esto evita conflictos con clicks en `Editar` / `Eliminar` / toggles.
- ✅ `touchAction: 'none'` correctamente aplicado en el handle (necesario en touch para que el drag no haga scroll).
- ✅ ID estable (`category.id` UUID), no `index`. Bien.
- ✅ `move(items, event)` del helper hace el reordenamiento puro/inmutable.
- ✅ **Optimistic update + rollback presente:** `setItems(newItems)` antes de llamar a `reorderCategories`, y si `result.success === false`, vuelve al snapshot inicial vía `setItems(initialCategories)`.
- ✅ **Bulk update server-side** vía RPC `reorder_categories(uuid[])` — un solo round-trip transaccional, no N updates. Esto es lo correcto para reorder a escala.
- ✅ El RPC `reorder_categories` está envuelto en una función PL/pgSQL (transacción implícita) — si falla a la mitad no quedan órdenes inconsistentes.
- ✅ Confirm/Cancel pendiente: el usuario puede mover varias filas y guardar en lote — buena UX, evita N llamadas al servidor por cada movimiento.
- ✅ Mientras `hasChanges` es true, las acciones por fila (Editar/Eliminar) se ocultan — evita interacciones inconsistentes con un orden no persistido.

### Hallazgos drag-drop

#### 🟡 No hay sensores explícitos configurados
**Archivo:** `CategoryList.tsx:311`
La nueva API de `@dnd-kit/react` usa sensores por defecto, pero **no se configuran** explícitamente. Esto significa:
- **Pointer sensor:** activo por defecto, OK para mouse/touch.
- **Keyboard sensor:** **no se confirma activación.** En la API legacy hacía falta `KeyboardSensor` explícito; en la nueva hay defaults pero el handle es un `<button>` sin lógica de teclado custom.
- Hoy el handle es un `<button type="button" aria-label="Arrastrar para reordenar">` — pero no se ve manejo de `Space`/`Arrow keys` para reordenar sin mouse.

**Acción:** verificar manualmente con Tab + Space + flechas si se puede reordenar sin mouse. Si no, agregar sensor de teclado o un par de botones "↑ / ↓" como fallback accesible.

#### 🟡 Sin `SortableContext` ni `strategy` explícita
**Archivo:** `CategoryList.tsx:311-324`
La API moderna de `@dnd-kit/react` no exige `SortableContext` (cada `useSortable` se autoregistra al `DragDropProvider`). Sin embargo, **no se especifica strategy** (vertical/horizontal/grid). Para una lista vertical pura puede funcionar, pero un `verticalListSortingStrategy` (o equivalente en la nueva API) ayuda en accesibilidad y previsibilidad de animaciones.

**Acción:** revisar docs `@dnd-kit/react` v0.3.2 para ver si hay un análogo (e.g. `<DragDropProvider sensors={[...]} strategy="vertical">`). Si no existe en esta versión, dejar nota — pero confirmar.

#### 🟡 Sin announcements de accesibilidad (ARIA live)
**Archivo:** `CategoryList.tsx`
No se ven announcements (`aria-live`) que comuniquen al lector de pantalla "Categoría X movida de la posición 3 a la 1". La librería puede traer defaults, pero no se inyecta texto en español. Para un usuario con NVDA/JAWS en español el feedback puede no ser claro.

**Acción:** verificar si `@dnd-kit/react` 0.3.2 expone hooks o props para customizar announcements en español. Si sí, configurar.

#### 🟡 Sin animación de drop (ni Framer ni nativa explícita)
**Archivo:** `CategoryList.tsx:39-48`
El item dragging solo cambia `background` y `opacity` con CSS `transition-colors`. No hay transformación con `transform: translateY(...)` aplicada a los demás items mientras uno se mueve, ni animación de drop. Se siente "rígido" comparado con productos similares.

`@dnd-kit/react` provee `transform` desde `useSortable`, pero **acá no se usa** — solo `ref` y `handleRef`. Eso significa que durante el drag, los demás items NO se desplazan visualmente — solo el array `items` se reordena cuando se suelta. Buena UX requiere el desplazamiento visual continuo.

**Acción:** extraer `transform` y `transition` desde `useSortable` y aplicarlos al `style` del row para que los items se desplacen suavemente durante el drag (siguiendo la guía de la librería). Esto NO requiere Framer — `@dnd-kit` lo hace nativamente.

#### 🔵 No se distingue "guardando" de "ya guardado" después del save exitoso
**Archivo:** `CategoryList.tsx:253-263`
Después de `handleSave` exitoso, se llama `setHasChanges(false)` pero **no** se actualiza `initialCategories` — la próxima vez que el usuario presione "Cancelar", volverá al orden original viejo (de antes del save). Ahora bien: como tras un save el componente recibe `revalidatePath('/admin/categorias')` y eventualmente Next refetch, *probablemente* no se note. Pero si el usuario hace dos rounds de cambios sin recarga visible, "Cancelar" del segundo round vuelve al orden de la carga inicial (no al guardado).

**Acción:** después de `result.success`, hacer `initialCategoriesRef.current = items` (con `useRef`) o pasar `initialCategories` a un state derivable.

---

## Hallazgos críticos 🔴

### `src/features/admin/actions/categories.ts` — **Sin auth check defensivo en Server Actions**
- **Problema:** Ninguna de las 7 server actions (`createCategory`, `updateCategory`, `reorderCategories`, `deleteCategory`, `getCategoryProductCount`, `toggleCategoryStatus`, `toggleCategoryFeatured`) llama `supabase.auth.getUser()` antes de mutar. Toda la protección depende de:
  1. `proxy.ts` que redirige a `/login` si no hay sesión en `/admin/*`.
  2. RLS de Supabase con políticas `TO authenticated` (cualquier usuario autenticado, sin distinción de rol).
- **Impacto:**
  - Las RPCs `reorder_categories`, `delete_category_cascade`, `delete_category_reassign` son `SECURITY DEFINER` — corren como el dueño de la función y **bypasean RLS**. Cualquier usuario con sesión puede invocarlas.
  - Si mañana hay registro público de usuarios "cliente" en Supabase Auth (por ejemplo para guardar favoritos), cualquiera de ellos puede llamar las actions y borrar/reordenar categorías.
  - El proxy filtra por path, pero las Server Actions de Next.js no son rutas convencionales — se identifican por un action ID en el body POST. El proxy las cubre **solo cuando se invocan desde una página `/admin/*`**, pero la regla de Next es que el action ID se valida solo por origen (CSRF). Si un atacante autenticado replica la request al endpoint de origen, pasa.
- **Líneas:** todo el archivo (1-213).
- **Solución:** crear `src/features/admin/lib/requireAdmin.ts` que haga `getUser()` + chequeo de `app_metadata.role === 'admin'` (o equivalente) y llamarlo al inicio de cada action. Patrón:
  ```ts
  async function requireAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('UNAUTHORIZED');
    // si hay tabla `admin_users` o claim de rol, verificar acá
    return supabase;
  }
  ```
  Aplicar también a `products.ts`, `flowerTypes.ts`, `productColors.ts` (mismo problema sistémico).

### Políticas RLS sin distinción de rol — `supabase/migrations/20260328000001_initial_schema.sql:176-188`
- **Problema:** Las policies INSERT/UPDATE/DELETE de `categories` usan `TO authenticated WITH CHECK (true)` — cualquier usuario autenticado puede mutar. No hay policy que requiera un claim de rol (`auth.jwt() ->> 'role' = 'admin'` o tabla `admin_users`).
- **Impacto:** stack con el hallazgo anterior — sin auth check en actions y con RLS abierta a todo authenticated, basta un solo cliente registrado para destruir el catálogo.
- **Solución:** o bien restringir RLS a un rol/claim específico (`USING (auth.jwt() ->> 'role' = 'admin')`), o, si se quiere mantener RLS actual, **obligatoriamente** agregar el chequeo en las server actions. Las dos capas son ideales (defensa en profundidad).

### `src/features/admin/components/CategoryList.tsx` — Archivo monolítico de 479 líneas
- **Problema:** un solo archivo mezcla:
  1. Componente `SortableRow` (drag-drop visual + actions inline)
  2. Componente `CategoryList` (lógica de drag, delete, toggle status, toggle featured)
  3. UI de doble confirm dialog (reassign/cascade delete)
  4. Lógica de optimistic update
  5. Lógica de productos asociados (fetch count + select reassign)
  Esto rompe SRP y dificulta lectura/test.
- **Líneas:** 1-479 (479 líneas — casi 5x el límite del proyecto).
- **Solución:** extraer
  - `CategoryRow.tsx` (la fila sortable, ~110 líneas)
  - `DeleteCategoryDialog.tsx` (toda la UI del dialog — 130 líneas)
  - `useCategoryReorder.ts` (hook con la lógica de drag + save + cancel)
  - `useCategoryDelete.ts` (hook con la lógica de fetch count + execute)
  Dejar `CategoryList.tsx` ≤ 100 líneas como composición.

---

## Hallazgos importantes 🟡

### `src/features/admin/actions/categories.ts` — Slug derivado del nombre, sin validar unicidad antes del insert
- **Problema:** `createCategory` y `updateCategory` calculan `slug = slugify(data.name)` y lo mandan a la DB. La unicidad la garantiza el constraint `UNIQUE` de la columna (línea 52 del schema), pero el error que vuelve al usuario es el mensaje crudo de Postgres (`duplicate key value violates unique constraint "..."`) — UX pobre.
- **Líneas:** `categories.ts:40, 69`
- **Solución:** antes del insert/update, hacer `select id from categories where slug = ? limit 1` (excluyendo el ID actual en update) y devolver `{ success: false, error: 'Ya existe una categoría con ese nombre/slug.' }` de forma controlada. O mapear el código de error `23505` de Postgres a un mensaje en español.

### `src/features/admin/actions/categories.ts:32-38` — `nextOrder` con race condition
- **Problema:** `createCategory` consulta `display_order` máximo, suma 1, y hace insert. Sin transacción, dos creates concurrentes pueden generar el **mismo `display_order`** y romper el orden del listado público.
- **Solución:** mover la lógica a una RPC `create_category_with_next_order(...)` con transacción explícita, **o** usar `display_order = (SELECT COALESCE(MAX(display_order), 0) + 1 FROM categories)` directamente en el INSERT (Postgres lo evalúa atómicamente bajo serializable, no bajo read committed por defecto). En la práctica, para un admin con 1 usuario es casi inexistente — pero queda como deuda.

### `src/features/admin/components/CategoryForm.tsx` — Sin validación de longitud/contenido
- **Problema:** el form no valida:
  - Nombre máximo (un nombre de 500 chars rompería UI).
  - Descripción mínima/máxima.
  - Que el slug resultante no sea string vacío (si el nombre es solo emojis o solo caracteres no-ASCII no permitidos por `slugify`, el slug queda `''` y la DB lo rechaza con error críptico).
- **Líneas:** 73-145
- **Solución:** validar en `formAction`:
  ```ts
  if (data.name.trim().length < 2) return { error: 'El nombre debe tener al menos 2 caracteres.' };
  if (slugify(data.name) === '') return { error: 'El nombre no genera un slug válido.' };
  ```
  Idealmente con Zod si se quiere algo robusto.

### `src/features/admin/components/CategoryForm.tsx:48-55` — Casts a `string` sin narrowing
- **Problema:** `formData.get('name') as string` para todos los campos del FormData. `FormData.get` devuelve `FormDataEntryValue | null` — el cast oculta el caso `null`. Si el form se manipula desde el browser, podría llegar `null`.
- **Líneas:** 48-55
- **Solución:** helper tipado `getString(form, key) → string` que valide y devuelva default `''`. Evita `as string` y respeta strict TS.

### `src/features/admin/components/CategoryList.tsx:165-171` — `handleDeleteRequest` no maneja error de `getCategoryProductCount`
- **Problema:** si `getCategoryProductCount` retorna `{ count: 0, error: 'algo' }`, el código ignora el error y procede como si no hubiera productos — el usuario podría borrar en modo "directo" una categoría que sí tiene productos (y fallaría más abajo).
- **Solución:** chequear `result.error` y mostrar `toast.error(...)` antes de abrir el dialog.

### `src/features/admin/actions/categories.ts:142, 159` — `void` en cleanup de Cloudinary sin manejo de error
- **Problema:** `void destroyCloudinaryImages(imageUrls)` y `void destroyCloudinaryImage(imageUrl)` arrojan a fire-and-forget. Si la API de Cloudinary falla (timeout, rate limit), la imagen queda huérfana en el CDN. No hay logging, retry ni cola.
- **Solución:** al menos `.catch(err => console.error(...))` para que aparezca en los logs de Vercel. Idealmente, una tabla `pending_deletions` que reintente en background.

### `src/features/admin/components/CategoryList.tsx:253-263` — Rollback parcial en falla de reorder
- **Problema:** si `reorderCategories` falla, el código hace `setItems(initialCategories)` — **el snapshot inicial original**, NO el último estado guardado. Si el usuario ya guardó una vez con éxito y luego intenta otro reorder que falla, vuelve al orden de la carga de página (perdiendo el primer save de su vista local — el server sí lo tiene).
- **Solución:** mantener `lastSavedOrder` en `useRef` y rollback a eso. O hacer `router.refresh()` tras el éxito para sincronizar.

### `src/app/(admin)/admin/categorias/page.tsx` — 107 líneas (un poco arriba del límite)
- **Problema:** mezcla parsing de filtro, fetch en paralelo, render del header con filtro activo y render del list. Pasa el límite del proyecto (100).
- **Solución:** extraer el banner de filtro activo a `<ActiveFilterBanner filterMeta={...} clearHref={...} />` reutilizable (ya existe en `/admin/productos` con copia/paste del mismo bloque — buena oportunidad para DRY).

### Sin `loading.tsx` ni `error.tsx` específicos para `/admin/categorias`
- **Problema:** la ruta hereda los del padre (`src/app/(admin)/admin/loading.tsx` y `error.tsx`), pero esos están diseñados para el dashboard (skeletons de KPI grid + charts). Para `/admin/categorias` el skeleton no representa la UI real (lista de filas con drag handle).
- **Solución:** crear `src/app/(admin)/admin/categorias/loading.tsx` con un skeleton de lista (filas con avatar 40x40 + texto). El error.tsx genérico puede servir, pero el mensaje "No se pudo cargar el dashboard" es engañoso fuera de `/admin`.

### Reorder/RPCs `SECURITY DEFINER` sin verificación de rol
- **Archivo:** `supabase/migrations/20260405000001_category_transaction_rpcs.sql`
- **Problema:** las 3 RPCs (`delete_category_cascade`, `delete_category_reassign`, `reorder_categories`) usan `SECURITY DEFINER` → bypasean RLS por completo. Sin verificación de rol dentro de la función, cualquier usuario autenticado puede llamarlas vía supabase-js si conoce el nombre.
- **Solución:** al inicio de cada función, validar `current_user` o un claim:
  ```sql
  IF (SELECT auth.jwt() ->> 'role') != 'admin' THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;
  ```
  O cambiar a `SECURITY INVOKER` y dejar que RLS rechace (requiere policies por rol primero).

### `proxy.ts` no protege Server Actions invocadas con un origin distinto
- **Problema:** el matcher es `['/admin/:path*', '/login']`. Una Server Action invocada desde el browser hace POST al path donde fue importada — si el referer es `/admin/categorias`, el proxy lo cubre. Pero Next 16 tiene el patrón "Action ID" — un atacante con el ID podría hacer POST a otra ruta del mismo dominio (no admin) y la action sigue corriendo. La protección de origen de Next mitiga, pero NO sustituye el auth check explícito.
- **Solución:** ver hallazgo crítico — agregar `requireAdmin()` en cada action.

### `src/features/admin/components/CategoryList.tsx:99-101` — Toast solo en algunos errores
- **Problema:** `handleToggleStatus` hace rollback silencioso si falla (`setItems` revertir, sin `toast.error`). En cambio `handleToggleFeatured` SÍ muestra toast. Inconsistencia UX.
- **Líneas:** 220-230 vs 232-243
- **Solución:** agregar `toast.error('Error al cambiar estado: ...')` en la rama de fallo de `handleToggleStatus`.

### `src/features/admin/components/CategoryList.tsx:411-428` — `<select>` nativo sin estilos visuales claros de focus
- **Problema:** el select para reasignar es nativo. Funciona y es accesible, pero el styling no muestra estado focus claramente (depende del browser).
- **Solución:** agregar `focus:ring-2 focus:ring-[var(--color-primary)] outline-none` para consistencia visual.

### `src/features/admin/components/CategoryList.tsx:53` — Clase Tailwind con valor arbitrario `hover:bg-[var(--color-surface)]`
- **Problema:** Tailwind v4 funciona, pero mezclar `style={{...}}` inline + `hover:bg-[var(--color-surface)]` es inconsistente. La mayoría del archivo usa `style={{ background: 'var(--color-surface)' }}` para colores.
- **Solución:** unificar criterio. La regla del proyecto es "variables CSS" — ambos cumplen, pero una sola convención hace mejor el código.

---

## Mejoras propuestas 🟢

### `slugify` compartido entre features
- **Archivo:** `src/features/admin/utils/slugify.ts`
- **Propuesta:** mover a `src/lib/slugify.ts`. Hoy vive bajo `features/admin/utils` pero también lo importa `features/admin/actions/products.ts`. Si mañana el catálogo público necesita slugify, va a duplicar.
- **Justificación:** util agnóstico de feature. La regla "feature folders" se aplica a lógica de dominio, no a primitivos de string.

### `slugify` no maneja edge cases
- **Archivo:** `src/features/admin/utils/slugify.ts`
- **Propuesta:** agregar truncado a 80 chars y un fallback si el resultado es vacío:
  ```ts
  return result || `categoria-${Date.now()}`;
  ```
- **Justificación:** evita slug vacío en DB (que falla con UNIQUE NOT NULL constraint sin mensaje claro al usuario).

### `CategoryForm` no permite editar el slug manualmente
- **Archivo:** `src/features/admin/components/CategoryForm.tsx:99-102`
- **Propuesta:** el input slug es `readOnly` — siempre se autoderiva del nombre. Si una categoría existente tiene un slug histórico distinto al que generaría hoy `slugify(name)`, **al editar y guardar se cambia el slug** (línea 23: `slug: slugify(row.name)`). Esto rompe SEO/links del catálogo público que apuntan al slug viejo.
- **Justificación crítica:** este es un bug que rompe URLs públicas. Subiría a 🟡 si el catálogo público está vivo. La solución es:
  - Mantener `readOnly` solo en CREATE.
  - En EDIT, mostrar el slug actual de la DB (no el regenerado), y hacerlo opcionalmente editable con warning "cambiar el slug invalida URLs existentes".
  - O, si no queremos complicar UX, **nunca** sobreescribir el slug al editar (mantener el de DB).

### `getAdminCategoryById` retorna `null` para CUALQUIER error
- **Archivo:** `src/features/admin/queries/categories.ts:25`
- **Propuesta:** distinguir "not found" (PGRST116) de un error de red/RLS. Hoy un fallo de RLS se confunde con "no existe" y dispara `notFound()` en la página, ocultando un problema real.
- **Justificación:** debugging y observabilidad.

### Sortable list sin paginación
- **Archivo:** `CategoryList.tsx`
- **Propuesta:** hoy hay 6 categorías. Si crece a 50+, el DOM con drag-drop empieza a sufrir. Considerar virtualización o paginación cuando supere ~30 items.
- **Justificación:** preventivo, no es urgente.

### `revalidatePath` no toca `/` (landing) en update/create
- **Archivos:** `categories.ts:47-48, 81-82`
- **Propuesta:** las categorías destacadas se muestran en el `CatalogSection` de la landing (`/`). `createCategory` y `updateCategory` revalidan `/catalogo` y `/admin/categorias` pero **no `/`**. Solo `toggleCategoryStatus` y `toggleCategoryFeatured` revalidan `/`. Si el admin edita el nombre o imagen de una categoría destacada, la landing queda con cache.
- **Justificación:** consistencia entre admin y vista pública.

### `revalidatePath('/catalogo')` no propaga a `/catalogo/[categoria]`
- **Archivo:** `categories.ts` en general
- **Propuesta:** Next 16 revalida exactamente el path. `revalidatePath('/catalogo', 'layout')` propaga a todas las rutas hijas. Si una categoría cambia de slug o se desactiva, los detalles bajo `/catalogo/[categoria]` siguen cacheados.
- **Justificación:** edición de categoría no se refleja en producto detalle hasta TTL.

### Botones de toggle sin hover state visual
- **Archivo:** `CategoryList.tsx:115-126`
- **Propuesta:** el `ShadcnButton variant="ghost"` para featured tiene `className="text-muted hover:text-secondary"` pero no se ve un fondo hover. La interacción es ambigua hasta hacer click.
- **Justificación:** affordance visual.

### Drag handle como `<button>` en vez de role="button" + div
- **Archivo:** `CategoryList.tsx:50-58`
- **Propuesta:** está OK. Solo, mejorar el `aria-label` para ser más explícito: `Arrastrar "${category.name}" para reordenar`. Hoy todos dicen lo mismo.
- **Justificación:** screen readers leen el contexto correcto.

### `CategoryList` no respeta `prefers-reduced-motion`
- **Archivo:** `CategoryList.tsx`
- **Propuesta:** las transiciones de `transition-colors` se aplican siempre. Para usuarios con `prefers-reduced-motion: reduce` se debería deshabilitar. El proyecto usa Tailwind v4, así que basta con la directiva `motion-safe:transition-colors`.
- **Justificación:** accesibilidad WCAG.

### `getCategoryProductCount` se llama POR CADA delete request
- **Archivo:** `CategoryList.tsx:166`
- **Propuesta:** el conteo de productos por categoría podría venir como columna calculada en `getAdminCategories()` (un `select ..., (select count(*) from products where category_id = categories.id) as product_count`). Así `handleDeleteRequest` no hace round-trip.
- **Justificación:** UX más rápida; mostrar el conteo permanente al lado del nombre también ayuda al admin.

---

## Resumen ejecutivo

**Funcional:** la pantalla funciona. Tipos correctos, RPCs transaccionales bien diseñados, optimistic update con rollback, dialog de confirmación elaborado (reassign/cascade), uso de `next/image`, paleta CSS respetada.

**Riesgos críticos a corto plazo:**
1. **🔴 Server Actions sin auth check defensivo** + RLS abierta a todo `authenticated` + RPCs `SECURITY DEFINER` sin chequeo de rol = una sola sesión válida cualquiera puede destruir el catálogo. Defensa en profundidad ausente.
2. **🔴 `CategoryList.tsx` de 479 líneas** — bomba de mantenibilidad; hay que partirlo.
3. **🟡 Slug se regenera en cada edit** — riesgo SEO si la categoría ya está indexada en buscadores con otro slug.

**Drag-drop:** funcional pero "estático" — no hay desplazamiento visual continuo de los items vecinos durante el drag (solo cambia background del item dragged). Usar `transform`/`transition` de `useSortable` mejoraría la sensación. Accesibilidad de teclado sin verificar.

**Acciones recomendadas en orden de prioridad:**
1. Crear `requireAdmin()` y aplicarlo a todas las actions de admin (no solo categorías — sistémico).
2. Restringir RLS a un rol específico, o agregar verificación dentro de las RPCs `SECURITY DEFINER`.
3. Refactor `CategoryList.tsx` → 4 archivos (Row, DeleteDialog, useReorder, useDelete).
4. Fix slug regen en update (no sobreescribir slug existente).
5. Mejorar drag-drop UX con `transform` + `transition` desde `useSortable`.
6. `loading.tsx` específico para `/admin/categorias`.
7. Validación de input en `CategoryForm` (longitud, slug vacío).
