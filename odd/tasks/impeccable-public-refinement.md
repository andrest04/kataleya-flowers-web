# Impeccable refinement of the public site

## Objective

Apply the Impeccable skill across the public Kataleya Flowers site (landing, catalog, product detail, search, Libro de Reclamaciones), refining the incumbent identity in `docs/DESIGN.md` rather than replacing it.

## Problem

Critiques on 2026-11-26 scored the public surfaces between 59% and 69%: the visual surface is on-brand, but structure is template-like, the positioning (32 years, Barranco store, hand-made craft) is nearly invisible, the WhatsApp order path is inconsistent, testimonials fabricate trust signals, and several primary CTAs lack weight.

## Scope

- In: `src/app/(public)/**`, `src/features/landing/**`, `src/features/catalog/**`, `src/features/complaints/components/**`, shared public chrome in `src/components/shared/**`, `src/components/ui/**`.
- Out: admin (`src/app/(admin)/**`, `src/features/admin/**`) and auth pages (`src/app/(auth)/**`), by user decision.

## Constraints

- Refine, do not redesign: palette, fonts and DESIGN.md world stay.
- AGENTS.md: palette changes, new dependencies and `src/app/layout.tsx` edits need explicit owner approval; no commits without explicit approval; no comments in production code; `BUSINESS` constants for contact data; `LazyMotion + m`; `next/image`; tokens only.
- No new factual copy or claims without owner approval (PRODUCT.md: never invent reviews, stars, figures).
- Single writer at a time; workers on Sonnet, parent orchestrates.

## Critique evidence

| Surface | Score | Snapshot |
|---|---|---|
| Landing | 19/32 | `.impeccable/critique/2026-11-27T00-35-08Z__src-app-public-page-tsx.md` |
| Catalog browse | 25/36 | `.impeccable/critique/2026-11-27T00-47-19Z__src-app-public-catalogo-page-tsx.md` |
| Product detail | 24/36 | `.impeccable/critique/2026-11-27T00-47-20Z__src-app-public-catalogo-categoria-slug-page-tsx.md` |
| Search | 25/40 | `.impeccable/critique/2026-11-27T00-47-37Z__src-app-public-buscar-page-tsx.md` |
| Libro de Reclamaciones | 26/40 | `.impeccable/critique/2026-11-27T00-46-57Z__src-app-public-libro-de-reclamaciones-page-tsx.md` |

## Tasks

- [x] T1 Shared foundations: order buttons red with white text (shared `primary`/`whatsapp` variants), focus-visible rings, `text-wrap: pretty` on body copy, `--color-muted` 65% → 72% ink (6.8:1 on cream). Commit `720d66b`. Verifier: pass.
- [x] T2 WhatsApp path: "Pedir" everywhere, navbar/drawer open `wa.me`, hero link prefilled, product message carries the product name, new mobile `WhatsAppFloat`. Commit `61c989f`. Verifier: pass.
- [x] T3 Honest testimonials: stars only when rated, no "Compra verificada", one real photo; heading unchanged (not approved). Commit `e6cb550`. Verifier: pass.
- [x] T4 Landing structure: "32 años en Barranco, Lima" kicker, `#nosotros` now holds the value props above contact, best sellers after catalog, duplicate fallback tile removed, 44px tabs, mobile search icon to `/buscar`. Commit `0e5ecf1`. Verifier: pass.
- [x] T5 Catalog browse: few-item grid, card meta line, "N arreglos" count and filter chips in the bar, text-pill category strip including Condolencias, end-of-grid WhatsApp CTA. Commits `a3f1b8d` + fix `b191b0f`.
- [x] T6 Product detail: mobile sticky order bar hidden at page end, description and "Incluye" under the CTA, repeated thumbnails dropped. Commits `8ccd0b1` + fix `511bba4`.
- [x] T7 Search: accent- and plural-tolerant matching (test-first), warm empty state with WhatsApp CTA, clear button. Commit `e8e5989`. Verifier: pass.
- [x] T8 Libro de Reclamaciones: neutral selected type, helper text, refined field skin. Commit `ca4bb3f`. Verifier: pass.
- [ ] T9 Close: re-critique every public surface and run `/impeccable polish`.

## Route per task

Each implementation task is delegated direct (one Sonnet writer via workflow; 2+ non-trivial files per task), verified with `npm run lint:strict`, `npx tsc --noEmit`, `npx vitest run`, and an `impeccable detect` + `shot` pass on the touched surface.

## Owner decisions

- Approved 2026-11-26: hero kicker "32 años en Barranco, Lima", single order verb "Pedir", darker `--color-muted`, one commit per task after green checks.
- Not approved: testimonials heading change.
- Open:
  - `FALLBACK_TESTIMONIALS` in `src/features/landing/queries/getPublishedTestimonials.ts` are invented quotes with 5 stars and render when no testimonial is published.
  - "Entrega el mismo día" is still duplicated by admin-managed DB content (promo banner + discover tile).
  - The hero kicker replaced the admin `slide.kicker`; `ValuePropsBand` now shows only on the landing.
  - Delivery zone/time claims and a workshop photo or story text for "Nosotros".
  - Footer hours read "8:00am - 7:00pm" instead of "8:00 a. m.".
  - `FilterChip` is under 44px and has no focus ring.
  - Review the helper copy in the complaint form.

## Verification evidence

- Baseline before T1: lint:strict, tsc, vitest green (66 files, 913 tests).
- After T8: lint:strict, tsc, vitest green per writer (70 files, 931 tests); parent spot check `npx tsc --noEmit` exit 0.
- Not verified: keyboard focus-visible pass, fixed mobile elements at a real 390px viewport, Playwright `phase1-verify` and `product-detail.spec.ts`.
- Branch diff vs `dev`: 45 files, +929/−392 (above the ~400-line delivery budget: PR slicing strategy still to choose).
- RDD: off globally, no native review run.

## Progress

- 2026-11-26: impeccable installed, PRODUCT.md updated, five public critiques done, branch `feat/impeccable-public-refinement` created from `dev`.
- 2026-11-26: T1–T8 implemented by sequential Sonnet writers, each independently verified; T5 and T6 needed one correction each.

## Next step

T9: re-critique the five public surfaces, then polish the remaining findings.
