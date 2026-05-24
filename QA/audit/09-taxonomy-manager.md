# Auditoría: TaxonomyManager (componente)

**Archivo:** `src/features/admin/components/ProductForm/TaxonomyManager.tsx`
**Fecha:** 2026-05-24
**Líneas:** 423 (límite del proyecto: <100 por componente UI → **4.23×**)
**Tipo:** Client Component genérico — manager inline de taxonomías (colores + tipos de flor)
**Usado por:** `ProductForm/ProductFormFields.tsx` (instancias para `colors` y `flowerTypes`)

> Esta auditoría se enfoca exclusivamente en un componente, no en una slice. Se incorpora al directorio `QA/audit/` para registrar la deuda y trazar el refactor posterior.

---

## Puntaje (código)

| Aspecto | Puntaje | Notas |
|---|---|---|
| **File boundary / tamaño** | **30/100** | 🔴 423 vs límite 100 |
| Responsabilidad única | 45/100 | 5 modos visuales + 2 flujos de estado conviven en el mismo archivo |
| Reutilización / DRY | 70/100 | Excelente patrón genérico (`<TItem extends TaxonomyItem>`), pero las 3 ramas de pill repiten estructura |
| Tipado | 88/100 | TS strict, generics correctos, `Result` discriminado, `CSSProperties` anotado |
| A11y | 62/100 | Inputs sin `aria-label`, hack `<FormField><></></FormField>`, `title`/`aria-label` inconsistente, falta `aria-live` en delete-confirm |
| Estilos / convenciones | 75/100 | Sin hex/rgb (usa CSS vars + `color-mix`), pero anchos `'130px'`/`'150px'` hardcoded |
| Performance | 85/100 | OK para volumen actual (~20 pills máx); recreación de objetos `pillBase` en cada render aceptable |
| Estado / hooks | 55/100 | 7 `useState` + 2 `useRef` + `useTransition` + 2 `useEffect` sin agrupación lógica |
| **Promedio general** | **64/100** | Funcional y semánticamente correcto; estructuralmente viola convenciones críticas |

---

## Hallazgos por severidad

### 🔴 CRITICAL

#### 🔴 1. Violación de file boundary (423 líneas)
**Líneas:** 1–423
`CLAUDE.md` § "File size discipline" exige `<100 líneas` por componente UI. Está **4.23× sobre el límite**.

**Solución:** Descomponer en carpeta `TaxonomyManager/` con `index.tsx` orquestador + sub-componentes.

#### 🔴 2. Cinco responsabilidades visuales en un solo `.map`
**Líneas:** 218–352

Dentro del map de items conviven 4 ramas + 1 modo de add fuera:
1. Pill en modo `rename` (223–257) — 35 líneas
2. Pill en modo `delete-confirm` (260–297) — 38 líneas
3. Pill en modo `manage` normal (300–338) — 39 líneas
4. Pill normal (delegando a `PillToggle`) (341–351) — 11 líneas
5. Add-new input + slot de extra (355–419) — 65 líneas

**Solución:** Cada rama → su propio sub-componente con render condicional en el index.

#### 🔴 3. Hook compuesto sin extraer
**Líneas:** 110–185

```
7 useState  +  2 useRef  +  useTransition  +  2 useEffect
+ 4 commit handlers (rename / delete / startDelete / add)
+ 1 helper (exists)
```

Toda la lógica de estado de gestión y add vive inline en el componente. Es un candidato claro a `useTaxonomyManager` custom hook.

### 🟡 WARNING

#### 🟡 4. Hack en `<FormField>` (líneas 200–202)
```tsx
<FormField label={label}>
  <></>
</FormField>
```
`FormField` fue diseñado para envolver inputs. Pasarle `<></>` solo para reutilizar el markup del label es un anti-patrón.

**Solución:** Componente `TaxonomyHeader` con su propio `<label>` + botón "Gestionar/Listo".

#### 🟡 5. A11y inconsistente
- Input de rename (226) y de add (357) sin `aria-label` (solo `placeholder` → no es label).
- Botones de manage (321, 332) usan `title` + `aria-label` redundante.
- Pill de delete-confirm sin `role="alert"` ni `aria-live` → screen reader no anuncia el `usageCount`.

**Solución:** Estandarizar `aria-label` (drop `title`), agregar `role="status" aria-live="polite"` al delete-confirm.

#### 🟡 6. Anchos hardcoded en `style` (`'130px'`, `'150px'`)
**Líneas:** 243, 378

No son tokens del design system. Si en otro lugar se necesita el mismo ancho, no hay reuso.

**Solución:** Constantes en `styles.ts` o clases Tailwind (`w-32`, `w-36`).

#### 🟡 7. Branch lógico `manageMode && !isPendingItem` triplicado
**Líneas:** 223, 260, 300

Indica que esa rama es un sub-componente con su propio render condicional interno (`<TaxonomyPillManage>` que decide entre `view | rename | delete-confirm`).

### 🟢 SUGGESTION

#### 🟢 8. Espaciado de import (línea 4)
`type ReactNode,useEffect` — falta espacio post-coma. `simple-import-sort` lo deja pasar, pero es ruido.

#### 🟢 9. Naming: `exists` → `isDuplicate`
**Línea:** 135
En contexto de `commitRename`/`commitAdd` el nombre `isDuplicate(name)` lee mejor que `exists(name)`.

#### 🟢 10. Consistencia con `startTransition`
**Línea:** 168
`void (async () => { ... })()` es válido, pero `commitRename` y `commitDelete` usan `startTransition`. Por consistencia, envolver `getUsageCount` también (aunque no muta DB, mantiene la convención de "operación pendiente").

---

## Plan de descomposición

Estructura siguiendo el patrón existente del proyecto (ver `HeroSection/`, `ProductForm/`):

```
src/features/admin/components/ProductForm/TaxonomyManager/
├── index.tsx                    ← orquestador (~75 líneas)
├── types.ts                     ← TaxonomyItem, TaxonomyActionResult, props
├── styles.ts                    ← pillBase, pillSelectedBg, anchos
├── useTaxonomyManager.ts        ← estado + handlers (rename/delete/add)
├── TaxonomyHeader.tsx           ← label + botón "Gestionar/Listo"
├── TaxonomyPillManage.tsx       ← pill en modo manage (rename | delete-confirm | view)
├── TaxonomyRenameInput.tsx      ← input inline para rename
├── TaxonomyDeleteConfirm.tsx    ← pill de confirmación con usage count
└── TaxonomyAddInput.tsx         ← input para crear nuevo (con slot renderExtraInput)
```

Estimado por archivo:

| Archivo | Líneas |
|---|---|
| `index.tsx` | ~75 |
| `useTaxonomyManager.ts` | ~80 |
| `TaxonomyPillManage.tsx` | ~50 |
| `TaxonomyAddInput.tsx` | ~60 |
| `TaxonomyDeleteConfirm.tsx` | ~40 |
| `TaxonomyRenameInput.tsx` | ~35 |
| `TaxonomyHeader.tsx` | ~25 |
| `types.ts` | ~30 |
| `styles.ts` | ~20 |

**Todos quedan bajo el límite de 100.**

---

## Riesgos del refactor

1. **Re-renders adicionales** por splitting → mitigado pasando handlers estables vía custom hook.
2. **Drift de tipos** al partir el `Props` actual → centralizarlo en `types.ts` y re-exportar desde `index.tsx`.
3. **Regresión en behavior de rename/delete** → cubrir con `tests/phase1-verify` + smoke admin manual.

---

## Verificación post-refactor (obligatoria)

- [ ] `npm run lint:strict` ✅
- [ ] `npx tsc --noEmit` ✅
- [ ] `npx playwright test phase1-verify` ✅
- [ ] Smoke manual: crear color, renombrar color, eliminar color con uso > 0, eliminar color con uso 0
- [ ] Smoke manual: mismo flujo para tipos de flor
- [ ] Verificar que cada archivo nuevo < 100 líneas
