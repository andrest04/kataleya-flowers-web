# Audit remediation

**Objective:** fix every observation from the 2026-11-25 general audit and from the security audit run-1, which used the Cloudflare security-audit skill.

**Problem:** the security audit confirmed one HIGH finding. Admin RSC pages are gated only by a layout, which a forged `Next-Router-State-Tree` header skips, so complaint PII leaks. It also left 11 needs-validation leads and 74 hardening notes. The general audit found about 50 findings across architecture, performance, SEO, accessibility, UX, copy and design.

**Why:** this is a production business that holds third-party PII. The legal Libro de Reclamaciones, the dependency CVEs, and SEO and accessibility all have real customer impact.

**Scope:** all observations, design included (user decision 2026-11-25). Owner-only console actions are listed separately. Each excluded observation has a reason.

**Constraints:**
- AGENTS.md and docs/design.md are binding.
- No new npm dependencies; version bumps of existing packages are allowed.
- The user approved editing `src/app/layout.tsx`, palette-usage changes and design changes.
- Zero comments in production code. No `eslint-disable` in `src/`.
- Playwright e2e is never run, because it hits production Appwrite.
- The agent never touches production Appwrite, Vercel or Resend.

**Delivery strategy:** `exception-ok`. There are no pull requests (solo developer, user decision). Each task is one work-unit Conventional Commit on `fix/audit-remediation`. The user merges to `dev`.

**Route:** each task is a delegated direct writer run through a workflow, one writer at a time. The trigger evidence is that every task touches two or more non-trivial files, or needs reading that prepares a write.

**Review:** receipt-driven development is off (global), so no native review runs. Each task is self-verified by its writer, followed by an independent verifier.

**Forecast:** 36 tasks, about 7980 authored changed lines. Lockfiles are excluded.

**Progress:** 36/36 done.

**Sources:**
- general audit workflow `wf_68c64c39-c2f`
- `~/security-audit-skill/kataleya-flawers-web/run-1/` (`findings.json`, `REPORT.md`)

## Checklist

- [x] **T01** Enforce admin authorization at the data-access layer for every admin query _(area security; about 180 lines; depends on nothing)_, commit `93776bc`
- [x] **T02** Upgrade Next.js, zod and vulnerable transitive packages to patched versions _(area dependencies; about 30 lines; depends on nothing; approved flags: dependency-version-bump)_, commit `cb1a0dc`
- [x] **T03** Anchor Appwrite storage URL parsing (client-safe path parser plus server ownership check) and harden the image proxy, upload and delete paths _(area security; about 420 lines; depends on T02)_, commit `5fee48b`
- [x] **T04** Add a durable, self-cleaning Appwrite-backed rate limiter, private document permissions, and bounded complaint submissions and consumer-copy emails _(area security; about 480 lines; depends on T03)_, commit `373e1fc`
- [x] **T05** Throttle and BotID-gate admin login, refuse non-admin sessions, harden and clear the session cookie, and mark server modules server-only _(area security; about 340 lines; depends on T01, T04)_, commit `8006a1a`
- [x] **T06** Fix the complaint number year to Lima time once at allocation, and keep a saved complaint successful when email or settings fail _(area security; about 300 lines; depends on T04, T05)_, commit `e8b6611`
- [x] **T07** Serve public product lookups from per-slug tagged caches with an active-category check, and serve category pages and navbar search from the cached catalog _(area security; about 240 lines; depends on T02)_, commit `b279ac6`
- [x] **T08** Restrict admin-entered links and map embeds to safe destinations _(area security; about 340 lines; depends on T03)_, commit `1d0a5f7`
- [x] **T09** Codify least-privilege Appwrite ACLs and the private-collection schema in the provisioning scripts _(area security; about 220 lines; depends on T04, T06)_, commit `1c9967b`
- [x] **T10** Fix lint:strict errors in e2e specs and the stale production host in SEO guard tests _(area tests; about 60 lines; depends on T02)_, commit `0ff92db`
- [x] **T11** Add a CI gate (lint, typecheck, unit tests) with a test that every admin Server Action enforces auth, and pin the workflow supply chain _(area tests; about 230 lines; depends on T02, T10)_, commit `8945c9d`
- [x] **T12** Remove binding-convention violations: the eslint-disable, production comments and the 550-line CatalogFilterSheet _(area conventions; about 640 lines; depends on T06, T11)_, commit `363662a`
- [x] **T13** Load analytics only on public production pages, allow GA in the CSP, and move Toaster to the admin layout _(area performance; about 70 lines; depends on T12; approved flags: layout.tsx)_, commit `ca70147`
- [x] **T14** Prerender catalog pages, sync filters with history.replaceState, and render every product link in server HTML _(area performance; about 300 lines; depends on T07, T12; approved flags: design-change)_, commit `f5011ff`
- [x] **T15** Send slim card DTOs to client components and compute best sellers on the server _(area performance; about 280 lines; depends on T14)_, commit `a1bd5a1 + cccfa68`
- [x] **T16** Lazy-load navbar overlays and load Framer Motion features asynchronously _(area performance; about 90 lines; depends on T13)_, commit `b28a1f7`
- [x] **T17** Route local public images through the built-in optimizer instead of the passthrough loader _(area performance; about 40 lines; depends on T03)_, commit `69f869d`
- [x] **T18** Remove /login and /buscar from the sitemap, noindex login, admin and query-bearing /buscar, and use real lastModified dates _(area seo; about 130 lines; depends on T10, T13, T15; approved flags: layout.tsx)_, commit `99dcda3`
- [x] **T19** Normalize the CMS website value to a single https origin and stop caching default settings on errors _(area seo; about 140 lines; depends on T08)_, commit `8767367`
- [x] **T20** Enrich Florist and Product JSON-LD (id, image, geo, hasMap, areaServed, sku, seller) from business constants, and drop empty images _(area seo; about 240 lines; depends on T07, T13, T15, T19; approved flags: layout.tsx)_, commit `60e0fbc`
- [x] **T21** Add local intent to titles and H1s, trim descriptions on word boundaries, size product OG images, redirect recategorized products, and add a fallback home H1 _(area seo; about 200 lines; depends on T14, T15, T17, T20; approved flags: design-change)_, commit `937cb53`
- [x] **T22** Carry admin-written image alt text through to the product gallery and lightbox _(area seo; about 110 lines; depends on T14, T15)_, commit `4e00407`
- [x] **T23** Keep complaint form values on failed submit, focus the first invalid field, and print the consumer copy from a sandboxed iframe _(area a11y-ux; about 320 lines; depends on T06, T12; approved flags: design-change)_, commit `50b535e`
- [x] **T24** Make complaint form widgets accessible and give each field an actionable error message _(area a11y-ux; about 200 lines; depends on T03, T23; approved flags: design-change)_, commit `a6a31ec`
- [x] **T25** Complete the navbar search combobox pattern with keyboard support, add mega-menu keyboard access, and stop iOS zoom in the mobile search _(area a11y-ux; about 330 lines; depends on T16; approved flags: design-change)_, commit `de8746b`
- [x] **T26** Announce login errors, dedupe skip links, add keyboard crop panning, and fix copy leftovers _(area a11y-ux; about 180 lines; depends on T05, T13, T18, T23, T25; approved flags: layout.tsx)_, commit `1a3ed8e`
- [x] **T27** Replace gold text and focus rings on light backgrounds with contrast tokens, enforce it in ESLint, and show the exact price after a size is chosen _(area design; about 110 lines; depends on T12, T15; approved flags: palette-usage, design-change)_, commit `eb96ee8`
- [x] **T28** Delete Supabase-era dead code and the unused withAdminAuth wrapper _(area architecture; about 400 lines; depends on T01, T05, T11)_, commit `f2378dc`
- [x] **T29** Extract one orderable-home-collection helper for testimonials, discover tiles and value props _(area architecture; about 300 lines; depends on T03, T11, T28)_, commit `204e677`
- [x] **T30** Make filterProducts the single catalog filter engine with facet exclusion _(area architecture; about 160 lines; depends on T14, T15)_, commit `521f6dc`
- [x] **T31** Untangle feature boundaries: shared zod primitives to lib/validation and landing limit/identity rules into features/landing/rules, keeping lib free of feature imports _(area architecture; about 300 lines; depends on T08, T24, T26, T29)_, commit `87df9de`
- [x] **T32** Bring AGENTS.md in line with the code after the remediation _(area docs; about 90 lines; depends on T04, T05, T06, T11, T13, T23, T25, T28, T29, T31)_, commit `519fecf`
- [x] **T33** Follow-up: clear react-doctor errors and warnings left after the remediation _(area conventions; about 250 lines; depends on T32)_, commit `78915a7`
- [x] **T34** Keep every file when several images are uploaded at once in ImageUploader _(area bugfix; about 80 lines; depends on T33)_, commit `0f30ef8 + 7914133`
- [x] **T35** Share one icon picker between the discover tile and value prop editors _(area refactor; about 120 lines; depends on T34)_, commit `6481501`
- [x] **T36** Stage fallback seeding writes sequentially inside the Appwrite transaction _(area reliability; about 60 lines; depends on T35)_, commit `0414d1c`

## Task details

### T01: Enforce admin authorization at the data-access layer for every admin query

**Observations:**
- SEC:admin-rsc-pages:layout-only-authz:requireAdminOrRedirect:router-state-tree-skip
- GEN:architecture-security:Complaint PII pages are protected only by the admin layout, not at data access
- SEC-H:[h04-admin-authz] Admin API route handlers each call requireAdmin directly and are a good pattern to copy into admin queries and pages

**Approach:** src/app/(admin)/layout.tsx:9 is the only requireAdminOrRedirect call. src/features/complaints/queries/complaints.ts:5-11 and every file in src/features/admin/queries/ read through the API-key repositories with no check, so a forged Next-Router-State-Tree header that skips the layout leaks complaint PII. Fix it at the read boundary. (1) In src/features/admin/utils/auth.ts, wrap requireAdmin in React cache() (import { cache } from 'react'), so one render makes one Appwrite session-and-membership check however many queries call it. cache() is a passthrough in Server Actions and route handlers, so action semantics stay the same. (2) Make `await requireAdmin();` the first statement of every exported function in src/features/complaints/queries/complaints.ts and in src/features/admin/queries/{adminFilters,categories,discoverTiles,flowerTypes,heroSlides,productColors,products,promoBanners,testimonials,valueProps}.ts. A skipped-layout render then throws AuthError and fails closed into src/app/(admin)/admin/error.tsx with no data. Keep the layout redirect as UX. Do not change the shape of AdminActionResult. Public queries that admin pages use (getSiteSettings, getPublishedPromoBanners and the fallbacks) stay unguarded because their data is public.

**Files:** `src/features/admin/utils/auth.ts`, `src/features/complaints/queries/complaints.ts`, `src/features/admin/queries/adminFilters.ts`, `src/features/admin/queries/categories.ts`, `src/features/admin/queries/discoverTiles.ts`, `src/features/admin/queries/flowerTypes.ts`, `src/features/admin/queries/heroSlides.ts`, `src/features/admin/queries/productColors.ts`, `src/features/admin/queries/products.ts`, `src/features/admin/queries/promoBanners.ts`, `src/features/admin/queries/testimonials.ts`, `src/features/admin/queries/valueProps.ts`, `src/features/admin/queries/adminQueries.test.ts`, `src/features/complaints/queries/complaints.test.ts`

**New files allowed in:** `src/features/admin/queries`, `src/features/complaints/queries`

**Test plan:** RED/GREEN with vitest. In the new complaints.test.ts and adminQueries.test.ts, vi.mock('@/lib/auth') so requireAdmin rejects with AuthError('UNAUTHENTICATED') and then 'FORBIDDEN', and vi.mock each repository module with spies. Table-drive every exported query: expect a rejection with AuthError and no repository call. Add one positive case where requireAdmin resolves and the repository result passes through. The tests are RED today because the queries call the repositories unconditionally. Do not assert cache() dedupe: outside the react-server condition, React cache is a passthrough in vitest.

**Acceptance:**
- Every exported function in src/features/admin/queries/*.ts and src/features/complaints/queries/complaints.ts calls requireAdmin before any repository call
- The new tests fail on the base commit and pass after the change
- requireAdmin is wrapped in React cache(); requireAdminOrRedirect and AdminActionResult are unchanged
- The admin pages still render for an admin in npm run dev

**Checks:** `npm run lint:strict`, `npx tsc --noEmit`, `npx vitest run`, `rg --files-without-match "requireAdmin\(\)" src/features/admin/queries src/features/complaints/queries --glob '!*.test.ts' (must list no file)`

**Risk:** Low. If cache() were misapplied, each query would repeat the Appwrite calls, which is slower but still correct. A missed query file keeps the leak open, so the rg check is mandatory.

**Commit:** `fix(admin): enforce requireAdmin in every admin and complaint query`

**Evidence:** RED 48/48 failing on base (writer + verifier worktree repro); GREEN vitest 22 files/284 tests; tsc 0; lint only the 9 known tests/ errors; independent verifier pass; assess tier high (RDD off, no native review). Not verified: admin pages render in npm run dev (needs live Appwrite) - owner smoke test.

### T02: Upgrade Next.js, zod and vulnerable transitive packages to patched versions

**Observations:**
- GEN:architecture-security:Production Next.js 16.2.6 and zod 4.3.6 are in known-vulnerable ranges
- SEC-H:[h11-supply-chain] package.json declares @next/third-parties ^16.3.5 while the lockfile root records 16.3.5; re-run npm install so package.json and package-lock.json agree

**Approach:** Verified on the host: the lockfile resolves next 16.2.6, zod 4.3.6, undici 6.26.0 and sharp 0.34.5. npm audit --omit=dev reports next as critical (affected range up to 16.4.4), and zod, undici, sharp, postcss, nanoid and source-map-js as high. (1) Set next ^16.4.6, eslint-config-next ^16.4.6, @next/eslint-plugin-next 16.4.6, @next/third-parties ^16.4.6 and zod ^4.6.7. Raise overrides.postcss to ^8.5.33. (2) Refresh the transitive undici with npm update undici; node-appwrite 26.2.0 already allows ^6.26.0, so it needs no major bump. (3) Run npm install so package.json and package-lock.json agree. (4) Read the Next 16.3 and 16.4 upgrade notes, and adjust next.config.ts only for a renamed or removed option, such as experimental.turbopackFileSystemCacheForDev. Add no new packages. If eslint-config-next 16.4 raises new lint errors in src files outside this list, stop and report the files to the parent, who extends the edit surface. User-approved surface extension (2026-11-25): src/components/shared/Navbar/useAnchorNavigation.ts, to satisfy the new @next/next/no-location-assign-relative-destination rule at line 31 without changing behavior.

**Files:** `package.json`, `package-lock.json`, `next.config.ts`, `src/components/shared/Navbar/useAnchorNavigation.ts`

**Test plan:** A version bump has no deterministic RED. The regression proof is the existing vitest suites, tsc and lint:strict, plus npm audit. Run a local npm run build only with owner consent, because generateStaticParams and the sitemap read production Appwrite (read-only). Do not run Playwright.

**Acceptance:**
- npm audit --omit=dev reports 0 high and 0 critical
- npm ls shows next 16.4.6+, zod 4.6.7+, undici 6.29.x and @next/third-parties 16.4.6+
- package.json and package-lock.json agree (npm ci succeeds)
- No new top-level dependency is added

**Checks:** `npm run lint:strict`, `npx tsc --noEmit`, `npx vitest run`, `npm audit --omit=dev (expect 0 high/critical)`, `npm ls next zod undici sharp @next/third-parties`

**Risk:** Medium. Two Next minors (16.2 to 16.4) can change caching, image and lint defaults, and new eslint-config-next rules can turn lint:strict red. The lockfile diff is generated and is not counted in the forecast.

**Commit:** `fix(deps): upgrade next, zod and vulnerable transitive packages`

**Evidence:** next/@next/* 16.4.6, zod 4.6.7, undici 6.29.1, sharp 0.35.5; npm audit --omit=dev 0 vulns; tsc 0; vitest 284/284; lint only 9 known tests/ errors; new no-location-assign-relative-destination fixed in useAnchorNavigation.ts (user-approved surface). Verifier pass, tier medium. Advisory: preview-deploy smoke test before merge.

### T03: Anchor Appwrite storage URL parsing (client-safe path parser plus server ownership check) and harden the image proxy, upload and delete paths

**Observations:**
- SEC:imageStorage/ownership:isOwnedStorageUrl:unbound-fetch-target-content-type-reflection
- SEC:src/lib/imageStorage/urlValidation.ts:parseAppwriteStorageUrl:fileid-path-traversal-api-key-delete
- SEC-H:[h06-image-api] urlValidation/ownership: parse with new URL(), require https, exact host, anchored pathname, exactly one project param, rebuild the fetch URL
- SEC-H:[h06-image-api] images/source route: validateImageBytes on the fetched buffer, serve only the detected image MIME with Content-Disposition inline and sandbox CSP, cap upstream body size
- SEC-H:[h06-image-api] images/upload route: request.formData() buffers the whole body before the 10 MB check; add a Content-Length pre-check
- SEC-H:[h06-image-api] appwriteProvider.ts:35 passes the client-supplied filename as the Appwrite file name; normalize to <uuid>.<ext>
- SEC-H:[h06-image-api] appwriteProvider.ts:22-36 ignores the validated mimeType; pass a validated extension so the stored type matches
- SEC-H:[h03-auth-session] images/upload route relies only on SameSite=Lax with no Origin or Sec-Fetch-Site check
- SEC-H:[h05-admin-storage-fetch] parseAppwriteStorageUrl anchored pathname match, reject dot segments, percent and backslash; delete() must call isOwnedStorageUrl and encode IDs
- SEC-H:[h05-admin-storage-fetch] isOwnedStorageUrl matches the storage pattern anywhere in the string, including query or fragment
- SEC-H:[h05-admin-storage-fetch] AppwriteImageStorageProvider.delete swallows all errors so cleanupWarning can never be returned
- SEC-H:[h13-stored-image-urls] isOwnedStorageUrl accepts duplicated project params, http:, non-special schemes and userinfo
- SEC-H:[h13-stored-image-urls] imageLoader.ts rewrites any src containing the storage-view pattern anywhere and replaces only the first /view
- SEC-H:[h13-stored-image-urls] raw untrimmed, non-canonical strings are persisted (testimonials.ts:35-36, heroSlides.ts:27-28 check isOwnedUrl before trimming)

**Approach:** Root cause, verified in the code: urlValidation.ts:1 runs the unanchored regex /storage/buckets/([^/]+)/files/([^/]+)/view over the raw string, and ownership.ts:31-35 checks only the host, the first project value and the bucket. The parser is split in two, because imageLoader.ts runs in the browser through the 'use client' StoredImage, and getAppwriteConfig() (config.ts:50-58) throws there for lack of server env. (1) New src/lib/appwrite/ids.ts holds APPWRITE_DATABASE_ID, APPWRITE_TEAM_ADMINS_ID, APPWRITE_COLLECTIONS, APPWRITE_BUCKETS and their types. It has no env access and is safe on the client. config.ts re-exports them, so its existing importers do not change. (2) urlValidation.ts exports a pure, config-free parseStorageViewPath(url), which imports only ids.ts. It rejects raw input that contains a backslash, '%' or a control character, then calls new URL(url) and requires protocol https: with no username or password. The pathname must match exactly ^(/[A-Za-z0-9._-]+)*/storage/buckets/<bucket>/files/<fileId>/view$, where bucket is in Object.values(APPWRITE_BUCKETS) and fileId matches [A-Za-z0-9][A-Za-z0-9._-]{0,35} and is not '.' or '..'. There is no hash. It returns { host, endpointPath, bucketId, fileId, projectParams }. (3) ownership.ts (server) adds the ownership check on top: host equals the endpoint host, endpointPath equals the endpoint pathname, and there is exactly one 'project' search param equal to projectId and no other param. It exposes parseOwnedStorageUrl(url) returning { bucketId, fileId, canonicalUrl }, with canonicalUrl rebuilt from config. isOwnedStorageUrl and isOwnedStorageUrlInFolder route through it. (4) In schemas/common.ts, storedImageUrl trims and then transforms to canonicalUrl, so only canonical strings are persisted. testimonials.ts:36 and heroSlides.ts:28 trim before isOwnedUrl. (5) AppwriteImageStorageProvider.delete uses parseOwnedStorageUrl and fails closed, logs failures with console.error and returns a boolean. deleteMany reports failures, so products.ts can return cleanupWarning. upload() names the file `${ID.unique()}.${extFromMime(input.mimeType)}`. (6) api/images/source/route.ts fetches only canonicalUrl. It rejects a Content-Length over 15 MB and aborts a streamed read past the cap, runs validateImageBytes on the buffer, and responds with the detected image MIME plus Content-Disposition: inline, X-Content-Type-Options: nosniff and Content-Security-Policy: sandbox. The local /images branch derives its MIME from the file extension. (7) api/images/upload/route.ts returns 403 unless Origin equals new URL(request.url).origin (or Sec-Fetch-Site is same-origin), and returns 413 when Content-Length exceeds 10 MB plus multipart overhead, before request.formData() runs. (8) imageLoader.ts uses only parseStorageViewPath and rebuilds the pathname by replacing the final /view segment with /preview.

**Files:** `src/lib/appwrite/ids.ts`, `src/lib/appwrite/config.ts`, `src/lib/imageStorage/urlValidation.ts`, `src/lib/imageStorage/urlValidation.test.ts`, `src/lib/imageStorage/ownership.ts`, `src/lib/imageStorage/ownership.test.ts`, `src/lib/imageStorage/appwriteProvider.ts`, `src/lib/imageStorage/appwriteProvider.test.ts`, `src/lib/imageStorage/types.ts`, `src/lib/imageLoader.ts`, `src/lib/imageLoader.test.ts`, `src/app/api/images/source/route.ts`, `src/app/api/images/upload/route.ts`, `src/features/admin/schemas/common.ts`, `src/features/admin/actions/testimonials.ts`, `src/features/admin/actions/heroSlides.ts`, `src/features/admin/actions/products.ts`

**New files allowed in:** `src/lib/appwrite`, `src/lib/imageStorage`, `src/lib`

**Test plan:** RED/GREEN with vitest. Add urlValidation.test.ts for parseStorageViewPath, and extend ownership.test.ts for parseOwnedStorageUrl. Each audit bypass must return null or false: a query decoy (/v1/locale?x=/storage/buckets/product_images/files/a/view&project=p), a fragment-carried pattern, dot-segment and %2e%2e traversal, backslash traversal in fileId, duplicated project params, http:, userinfo, a non-special scheme, a wrong bucket and a wrong project. Add a control case: a valid canonical URL is accepted and canonicalized. Add appwriteProvider.test.ts with vi.mock('@/lib/appwrite/admin'): delete() on a crafted traversal URL never calls storage.deleteFile, and a valid URL calls it with the parsed IDs. Add imageLoader.test.ts: a decoy in the query string is passed through unchanged, and a canonical URL is rewritten to /preview with width, quality and output. imageLoader.test.ts sets no APPWRITE_* env, which proves the loader is config-free. Every case is RED today and GREEN after the change. Route handlers have no test harness, so they are covered by tsc and lint.

**Acceptance:**
- parseStorageViewPath and imageLoader import nothing from src/lib/appwrite/config.ts (rg)
- Every bypass case listed in the test plan is rejected, and the canonical URL is accepted
- storedImageUrl output is the canonical URL
- delete() never calls storage.deleteFile for an unowned or traversal URL and returns false on failure
- The upload route returns 403 on a cross-origin Origin and 413 on an oversized Content-Length before parsing the body
- The source route responds with the detected MIME and the nosniff and sandbox headers

**Checks:** `npm run lint:strict`, `npx tsc --noEmit`, `npx vitest run`, `rg -n "appwrite/config" src/lib/imageLoader.ts src/lib/imageStorage/urlValidation.ts (expect no match)`

**Risk:** Medium. The stricter parser rejects any stored URL that is not canonical. upload() at appwriteProvider.ts:38 already emits the canonical form, so existing records should pass, but the owner should spot-check images in the admin forms after deploy. A wrong endpoint-path prefix would break every image.

**Commit:** `fix(images): anchor storage URL parsing and harden image routes`

**Evidence:** RED 33/36 failing then GREEN 60/60 targeted; full vitest 25 files/336; tsc 0; lint known-only. Verifier pass, tier medium. Note: stored image URLs must be canonical https single ?project param; legacy non-canonical records fail validation on next edit.

### T04: Add a durable, self-cleaning Appwrite-backed rate limiter, private document permissions, and bounded complaint submissions and consumer-copy emails

**Observations:**
- SEC:complaints/rateLimit:in-memory-full-ip-key
- SEC:complaints/email:unverified-consumer-recipient-relay
- GEN:architecture-security:Complaint rate limiter is in-memory, so it limits only within one serverless instance
- GEN:architecture-security:Complaints repository bypasses the DocumentStore port
- SEC-H:[h01-complaints-abuse] checkComplaintRateLimit sweeps the entire bucket Map on every call (O(n))
- SEC-H:[h15-complaints-acl] AppwriteDocumentStore.getById swallows every error as null; map only 404 to null
- SEC-H:[h15-complaints-acl] '...and pass explicit permissions: [] in store.create for complaints' (second half of the provisioning note)

**Approach:** rateLimit.ts:11 keeps a module-scope Map keyed on the first XFF token. submitComplaint.ts:27-36 charges before validation, and sendComplaintEmails.ts:38 sends to any consumerEmail. New dependencies are not allowed, so reuse Appwrite's atomic increment. (1) DocumentStore port (src/lib/database/types.ts): create() takes an optional 4th argument { permissions?: string[] }, forwarded to createDocument. Add increment(collectionId, id, attribute, by, createData): Promise<number>. It increments atomically, and on a 404 creates the document from { ...createData, [attribute]: by } with permissions [], retrying the increment on a 409. Add deleteExpired(collectionId, field, before: string, limit: number): Promise<void>, implemented with databases.deleteDocuments and the queries [Query.lessThan(field, before), Query.limit(limit)], which node-appwrite 26.2.0 supports (services/databases.d.ts:2050). Implement all three in src/lib/database/appwriteProvider.ts and in testUtils/fakeDocumentStore.ts; the fake records permissions and compares ISO strings. In appwriteProvider.ts, getById maps only an AppwriteException with code 404 to null and rethrows everything else. (2) The complaints repository: allocateCorrelativo uses store.increment(APPWRITE_COLLECTIONS.counters, counterDocId(year), 'value', 1, {}), and insert calls store.create(..., { permissions: [] }). COLLECTION_ID uses APPWRITE_COLLECTIONS.complaints. Drop the direct createAdminClient, getAppwriteConfig and AppwriteException imports. (3) New src/lib/rateLimit/: a RateLimiter port hit(scope, key, { limit, windowMs }) returning { allowed, count }. The DocumentStore implementation uses APPWRITE_COLLECTIONS.rateLimits ('rate_limits', added to ids.ts from T03). The document id is the sha256 of `${scope}:${key}:${windowStart}`, hex, sliced to 36 characters. The attribute is count, and createData is { expires_at: new Date(windowStart + windowMs).toISOString() }. Growth stays bounded: when a hit returns count === 1 (it opened a new window document), the limiter calls store.deleteExpired('rate_limits', 'expires_at', now, 100) best-effort, catching and logging errors with console.error. Steady-state size then tracks the live windows, not history. clientKey.ts reads the first x-forwarded-for hop, or else x-real-ip, and aggregates IPv6 to its /64. (4) submitComplaint keeps checkBotId first, then validates the schema, then applies limiter 'complaint-ip' at 3 per 15 min. It fails open with console.error on store errors, so the legal channel never goes down. After the insert, it runs 'complaint-recipient' keyed on the lowercased consumerEmail (3 per 24 h) and 'complaint-consumer-copy-global' (200 per day). When either is exceeded, sendComplaintEmails skips the consumer copy (a new option) but still sends the business notification, and emailSent=false makes the UI offer the printable copy. (5) Delete the Map-based checkComplaintRateLimit and its sweep. ComplaintSubmitResult is unchanged. The thresholds are documented defaults the owner can tune.

**Files:** `src/lib/database/types.ts`, `src/lib/database/appwriteProvider.ts`, `src/lib/database/appwriteProvider.test.ts`, `src/lib/database/testUtils/fakeDocumentStore.ts`, `src/lib/database/testUtils/fakeDocumentStore.test.ts`, `src/lib/database/repositories/complaints/appwriteRepository.ts`, `src/lib/database/repositories/complaints/appwriteRepository.test.ts`, `src/lib/appwrite/ids.ts`, `src/lib/rateLimit/index.ts`, `src/lib/rateLimit/types.ts`, `src/lib/rateLimit/documentStoreRateLimiter.ts`, `src/lib/rateLimit/documentStoreRateLimiter.test.ts`, `src/lib/rateLimit/clientKey.ts`, `src/lib/rateLimit/clientKey.test.ts`, `src/features/complaints/utils/rateLimit.ts`, `src/features/complaints/actions/submitComplaint.ts`, `src/features/complaints/email/sendComplaintEmails.ts`

**New files allowed in:** `src/lib/rateLimit`

**Test plan:** RED/GREEN with vitest on the fake store. In documentStoreRateLimiter.test.ts: one key is allowed 3 times and then denied; a new window resets the count; two limiter instances sharing one store share the count (RED against the per-module Map); and opening a new window deletes the expired documents of earlier windows, so the store size stays bounded (RED: no cleanup exists). In clientKey.test.ts: an XFF chain is keyed on its first hop, and 12 addresses in one IPv6 /64 map to one key (RED today). The fakeDocumentStore and appwriteProvider tests cover increment create-on-404 with permissions [] and retry-on-409, create forwarding permissions, deleteExpired query building, and getById rethrowing a non-404 error (RED today). The complaints repository test checks sequential correlativos through the fake store and permissions [] on the inserted document.

**Acceptance:**
- No module-scope Map remains in src/features/complaints/utils/rateLimit.ts, or the file is deleted
- The complaints repository imports neither createAdminClient nor AppwriteException
- Complaint, counter and rate_limits documents are created with permissions []
- A rate-limiter window that opens triggers deletion of expired rate_limits documents (fake-store test)
- A 4th complaint from the same IP within 15 min is rejected; store errors fail open
- An exceeded per-recipient or global cap skips only the consumer copy and returns emailSent=false
- getById returns null only on a 404

**Checks:** `npm run lint:strict`, `npx tsc --noEmit`, `npx vitest run`, `rg -n "createAdminClient|AppwriteException" src/lib/database/repositories/complaints/appwriteRepository.ts (expect no match)`

**Risk:** Medium-high. If 'rate_limits' or its attributes are missing in production, every complaint takes the fail-open path, and from T05 on every admin login fails closed. Each submission adds 1 to 3 Appwrite writes, plus an occasional bulk delete. With getById rethrowing, errors that were hidden as null can now surface, so review the findById callers.

**Deploy steps (owner):**
- Before deploying: in Appwrite database 'kataleya', create collection 'rate_limits' with integer attribute 'count' (not required, default 0), datetime attribute 'expires_at' (not required), a key index on expires_at, empty Permissions and Document security off. Alternatively, run scripts/provision-private-collections.mjs from T09 as a dry-run and then with --apply.

**Commit:** `feat(security): add durable rate limiter and bound complaint emails`

**Evidence:** Durable Appwrite rate limiter with fail-open decorator, expires_at cleanup, private permissions, complaint per-recipient/global email caps. Verifier pass, tier medium. HARD PREREQUISITE before deploy: rate_limits collection (count, expires_at + index).

### T05: Throttle and BotID-gate admin login, refuse non-admin sessions, harden and clear the session cookie, and mark server modules server-only

**Observations:**
- SEC:src/lib/auth/appwriteProvider.ts:login:api-key-client-unthrottled-password-session
- GEN:architecture-security:Admin login has no throttling or BotID, and Appwrite per-IP limits cannot help
- SEC-H:[h03-auth-session] auth.ts:27-43 issues a session cookie to any valid Appwrite account, admin or not; check admin membership at login
- SEC-H:[h03-auth-session] logout swallows a failed deleteSession while the cookie is cleared; surface the failure or retry
- SEC-H:[h03-auth-session] cookie name is not __Host- prefixed and secure depends on NODE_ENV
- SEC-H:[h12-wildcard] proxy.ts at repository root is never detected by Next 16 when the app lives in src/app; move or delete it (redirect loop risk)
- SEC-H:[h04-admin-authz] proxy.ts sits at the repository root and is probably never deployed; do not count it as a control
- SEC-H:[h03-auth-session] proxy.ts at the repo root is not detected; its cookie-presence redirects are inert and its comments misleading
- SEC-H:[h10-appwrite-acl] src/lib/appwrite/session.ts:15 constructs a session-scoped Databases client that no data path uses
- SEC-H:[h15-complaints-acl] createSessionClient returns an unused Databases instance
- SEC-H:[h12-wildcard] '...requireAdminOrRedirect should delete the session cookie before redirecting on UNAUTHENTICATED/FORBIDDEN' (tail of the proxy.ts note)
- SEC-H:[h09-platform-secrets] no module imports the server-only package

**Approach:** loginAction (src/features/admin/actions/auth.ts:27-43) runs only zod. It creates the session with the API-key client (appwriteProvider.ts:13-14), which bypasses Appwrite's abuse limiter, and it sets the cookie for any account. (1) Register { path: '/login', method: 'POST' } in initBotId in src/instrumentation-client.ts, and call checkBotId() first in loginAction. (2) Use the T04 RateLimiter, failing closed: scope 'login-email' keyed on the lowercased email (5 per 15 min) and scope 'login-ip' via clientKey (20 per 15 min). Add the 'RATE_LIMITED' and 'FORBIDDEN' literals to LoginFailure.code; the {ok,error,code} shape is unchanged, and login/page.tsx maps both codes to safe Spanish messages. (3) AuthProvider.login also returns the session userId. AuthService.login calls provider.isAdmin(userId) before sessions.set; a non-admin gets provider.logout(secret) and FORBIDDEN, so no cookie is ever issued. (4) provider.logout returns a boolean and retries deleteSession once. service.logout still deletes the cookie but logs a failure with console.error. (5) The cookie: SESSION_COOKIE_NAME becomes '__Host-a_session', and the options are httpOnly, secure: true, sameSite 'lax', path '/', with no domain. CookieSessionStore.delete must call cookieStore.set(name, '', { ...options, maxAge: 0 }), or delete({ name, path: '/', secure: true }). A bare delete(name) emits a Set-Cookie without Secure, which browsers reject for a __Host- cookie, so logout would silently fail. (6) Stale-cookie cleanup: a Server Component layout cannot write cookies. requireAdminOrRedirect redirects to '/login?session=ended' (keeping error=forbidden for FORBIDDEN). The new 'use server' clearStaleSessionAction in actions/auth.ts calls the new AuthService.clearSession(), which deletes the store cookie only and makes no provider call. login/page.tsx calls it once in a mount effect when session=ended is present. A Server Action is POST with Next's Origin check, so this adds no logout-CSRF GET surface. (7) Delete the root proxy.ts: Next resolves proxy only under src/, so it is inert today, and moving it as-is would create the /login to /admin loop. (8) Drop the unused Databases from createSessionClient. (9) server-only: verified that next ships it. next/dist/compiled/server-only/{index,empty}.js exists, next/dist/build/create-compiler-aliases.js:186-197 aliases 'server-only$' for both the server and client layers, and next/types/global.d.ts:57 declares the module, so adding the import adds no npm dependency. Add `import 'server-only';` as the first line of src/lib/appwrite/admin.ts, session.ts, account.ts and config.ts, and src/lib/email/resendProvider.ts. None of them has a client importer: T03 moved the client-needed constants to ids.ts, and the only client imports of lib/database are `import type`. In vitest.config.ts, add resolve.alias { 'server-only': 'next/dist/compiled/server-only/empty.js' }, because vitest does not run Next's aliasing. User-approved surface extension (2026-11-25): move DOC_TYPES/ITEM_TYPES/COMPLAINT_STATUSES (and derived types) into a new zod-free client-safe src/features/complaints/schemas/constants.ts, re-export them from complaint.ts, and switch the 3 client components to import from constants.ts. That breaks the client chain to src/lib/appwrite/config.ts, which can then be marked server-only.

**Files:** `src/features/admin/actions/auth.ts`, `src/features/admin/actions/auth.test.ts`, `src/features/admin/utils/auth.ts`, `src/instrumentation-client.ts`, `src/lib/auth/types.ts`, `src/lib/auth/service.ts`, `src/lib/auth/service.test.ts`, `src/lib/auth/appwriteProvider.ts`, `src/lib/auth/appwriteProvider.test.ts`, `src/lib/auth/sessionCookie.ts`, `src/lib/auth/cookieSessionStore.ts`, `src/lib/auth/cookieSessionStore.test.ts`, `src/lib/appwrite/session.ts`, `src/lib/appwrite/admin.ts`, `src/lib/appwrite/account.ts`, `src/lib/appwrite/config.ts`, `src/lib/email/resendProvider.ts`, `src/app/(auth)/login/page.tsx`, `vitest.config.ts`, `proxy.ts`, `src/features/complaints/schemas/constants.ts`, `src/features/complaints/schemas/complaint.ts`, `src/features/complaints/components/ComplaintForm/ConsumerFields.tsx`, `src/features/complaints/components/ComplaintForm/ItemFields.tsx`, `src/features/complaints/components/admin/ComplaintStatusForm.tsx`

**New files allowed in:** `src/features/admin/actions`, `src/lib/auth`

**Test plan:** RED/GREEN with vitest. service.test.ts, using a fake provider and session store: a valid non-admin login sets no session, returns FORBIDDEN and calls provider.logout (RED: service.ts:9-14 sets the cookie unconditionally); an admin login sets the session; a logout whose revoke fails still clears the store and reports the failure; clearSession deletes the store without calling the provider. appwriteProvider.test.ts: login returns the userId from the mocked session. cookieSessionStore.test.ts mocks next/headers and asserts that set uses '__Host-a_session' with secure:true and path '/', and that delete emits the cookie with secure:true, path '/' and maxAge 0 (RED today). auth.test.ts mocks botid/server, the limiter and '@/lib/auth': the 6th attempt for the same email returns RATE_LIMITED without calling auth.login, and a failed BotID check returns before the limiter runs. The existing suites that import config.ts must stay green through the server-only alias.

**Acceptance:**
- A non-admin with valid credentials gets FORBIDDEN and no Set-Cookie
- The 6th login attempt per email within 15 min returns RATE_LIMITED
- The cookie is __Host-a_session with Secure, HttpOnly, SameSite=Lax and Path=/, and logout clears it
- An admin redirected with session=ended loses the stale cookie on the login page
- proxy.ts is deleted, and createSessionClient no longer constructs Databases
- Exactly the 5 listed server modules import 'server-only', and vitest, tsc and lint pass

**Checks:** `npm run lint:strict`, `npx tsc --noEmit`, `npx vitest run`, `rg -n "a_session" src tests (only the new __Host- constant and spec helpers)`, `rg -l "import 'server-only'" src (expect exactly the 5 listed files)`

**Risk:** Medium. The rename logs current admins out once. Failing closed means a rate_limits store outage blocks admin login. Safari/WebKit has historically refused Secure cookies on http://localhost, and the __Host- prefix requires Secure, so local admin login in Safari needs `npm run dev -- --experimental-https` (built into Next, no npm dependency). Chromium and Firefox treat http://localhost as secure. This is documented in T32. A missed client importer of a server-only module fails the build; the rg and tsc checks plus a review of the import graph mitigate that.

**Deploy steps (owner):**
- The T04 'rate_limits' collection must exist before deploy, or admin login fails closed.
- After deploy, the admin logs in again: the cookie is renamed to __Host-a_session.

**Commit:** `fix(auth): throttle admin login and harden the session cookie`

**Evidence:** RED: I wrote the new tests first, in service.test.ts, appwriteProvider.test.ts, the new cookieSessionStore.test.ts and the new actions/auth.test.ts. `npx vitest run src/lib/auth src/features/admin/actions` gave 16 failed and 18 passed. The failures were:
- login returned no userId;
- logout returned | checks: npm run lint:strict: Fails with exactly the 9 known base errors, all in tests/*.s; npx tsc --noEmit: exit 0, no errors; npx vitest run: Test Files 30 passed (30); Tests 388 passed (388); rg -n "a_session": 4 matches. One is the constant at src/lib/auth/sessionCookie; rg -l "import: Exactly 5 files: src/lib/appwrite/{admin,session,account,con; node <scratchpad>/trace-client-imports.mjs .: Before the change, 4 chains from 'use client' files reached ; npx react-doctor@latest --verbose: Score 100/100, no issues found; security-review self-check (inline): No finding at confidence 8 or higher. Note: the FORBIDDEN co | verifier pass, tier high | deploy: - HARD PREREQUISITE: the T04 'rate_limits' collection (count, expires_at and an index) must exist before deploy. Admin login fails closed without it and returns INTERNAL for every attempt.
- After deploy, every admin is logged out once and must log in again, because the cookie is renamed to __Host-a

### T06: Fix the complaint number year to Lima time once at allocation, and keep a saved complaint successful when email or settings fail

**Observations:**
- SEC-H:[h12-wildcard] complaint correlativo year and formatComplaintNumber use server-local (UTC) time; use America/Lima
- SEC-H:[h02-complaints-integrity] submitComplaint.ts:49 keys the counter on server-timezone year while format.ts:7 uses createdAt year
- SEC-H:[h01-complaints-abuse] getSiteSettings or template errors inside sendComplaintEmails propagate after the complaint is inserted
- SEC-H:[h02-complaints-integrity] split the post-insert email step into its own try and persist emailSent (email_sent never updated)
- SEC-H:[h01-complaints-abuse] the VALIDATION response returns the full zod issues array
- SEC-H:[h02-complaints-integrity] templates.ts interpolates provider.website raw into an href
- SEC-H:[h02-complaints-integrity] templates.ts puts provider.name raw into the email subject
- SEC-H:[h09-platform-secrets] resendProvider.ts builds the Resend client at module scope

**Approach:** submitComplaint.ts:48-90 wraps allocate, insert and sendComplaintEmails in one try, so a throw after the insert returns INTERNAL for a saved complaint and invites a duplicate with a new correlativo. The allocation instant and Appwrite's $createdAt can fall on opposite sides of Lima midnight on Dec 31, so the year is computed once and persisted. (1) format.ts gets limaYear(date) via Intl.DateTimeFormat('en-US', { timeZone: 'America/Lima', year: 'numeric' }). submitComplaint computes `const year = limaYear(new Date())` once, allocates the counter with it, and inserts it as correlativo_year. (2) Complaint, ComplaintInsert and ComplaintCreated (repositories/complaints/types.ts) gain correlativoYear: number | null, mapped from the correlativo_year attribute. (3) formatComplaintNumber(correlativo, { year, createdAt }) uses year when it is present. Otherwise, for legacy rows only, it uses new Date(createdAt).getUTCFullYear(), which reproduces the numbers issued before this change (their counter used the UTC server year), so historical numbers do not change. Update its callers: submitComplaint, ComplaintsTable.tsx:55,93 and ComplaintDetail.tsx:39. (4) After a successful insert, the email step runs in its own try/catch: any throw means emailSent=false with success still true. On success it calls the new complaintsRepository.markEmailSent(id), which updates email_sent. (5) VALIDATION issues are mapped to { path, message } only, since ComplaintForm/index.tsx:83-86 reads only those fields. Narrow the type in src/features/complaints/types.ts. (6) templates.ts:112 builds adminUrl from new URL(provider.website).origin and passes it through escapeHtml. The subjects (:102, :128) use provider.name with control characters stripped, capped at 120 characters. (7) resendProvider.ts creates the Resend client lazily inside sendBatch, returns { ok:false } when RESEND_API_KEY is missing, and keeps the T05 server-only import.

**Files:** `src/features/complaints/actions/submitComplaint.ts`, `src/features/complaints/actions/submitComplaint.test.ts`, `src/features/complaints/utils/format.ts`, `src/features/complaints/utils/format.test.ts`, `src/features/complaints/email/templates.ts`, `src/features/complaints/email/templates.test.ts`, `src/features/complaints/email/sendComplaintEmails.ts`, `src/features/complaints/types.ts`, `src/features/complaints/components/admin/ComplaintsTable.tsx`, `src/features/complaints/components/admin/ComplaintDetail.tsx`, `src/lib/database/repositories/complaints/types.ts`, `src/lib/database/repositories/complaints/appwriteRepository.ts`, `src/lib/database/repositories/complaints/appwriteRepository.test.ts`, `src/lib/email/resendProvider.ts`

**New files allowed in:** `src/features/complaints/actions`, `src/features/complaints/utils`, `src/features/complaints/email`

**Test plan:** RED/GREEN with vitest. format.test.ts: limaYear('2027-01-01T04:30:00Z') is 2026, and formatComplaintNumber(7, { year: 2026, createdAt: '2027-01-01T05:10:00Z' }) is '00007-2026' (the stored year wins over createdAt); a legacy row with year null uses the UTC year of createdAt. submitComplaint.test.ts mocks botid, the limiter, the repository and sendComplaintEmails, which throws after the insert. It expects success:true and emailSent:false (RED today: INTERNAL); allocateCorrelativo and insert receive the same Lima year; a VALIDATION result carries only path and message. templates.test.ts: a website containing a double quote or < never appears raw in the business HTML, every consumer free-text field is escaped, and the subject has no control characters. The repository test checks that correlativo_year round-trips and that markEmailSent updates email_sent.

**Acceptance:**
- The year passed to allocateCorrelativo equals the correlativo_year stored on the complaint
- formatComplaintNumber prefers the stored year; legacy numbers are unchanged
- A throw in sendComplaintEmails after the insert yields success:true and emailSent:false
- email_sent is set to true after a successful send
- VALIDATION issues contain only path and message
- The Resend client is not built at module scope

**Checks:** `npm run lint:strict`, `npx tsc --noEmit`, `npx vitest run`

**Risk:** Medium. The production attribute must exist before deploy. New complaints filed between 19:00 and 24:00 Lima time on Dec 31 change year, which is the intended fix. Escaping keeps the AGENTS.md rule for complaint templates. markEmailSent adds one Appwrite update per complaint.

**Deploy steps (owner):**
- Before deploying: in Appwrite complaints, create the integer attribute 'correlativo_year' (not required, no default). Otherwise every insert fails with Unknown attribute. T09's script can also create it.

**Commit:** `fix(complaints): persist the Lima year and isolate the email step`

**Evidence:** RED: I added the tests first and ran `npx vitest run src/features/complaints src/lib/database/repositories/complaints`. Result: 4 files failed, 19 tests failed, 26 passed. The failures were:
- format.test.ts: limaYear does not exist; formatComplaintNumber has the old signature.
- submitComplaint.tes | checks: npm run lint:strict: Exactly the 9 known errors remain, all in tests/*.spec.ts (c; npx tsc --noEmit: Clean, no output.; npx vitest run: 33 files passed, 413/413 tests.; npx react-doctor@latest --verbose: Score 100/100, no issues found. | verifier pass, tier medium | deploy: This is a hard prerequisite with no fallback. Before deploying, create the integer attribute 'correlativo_year' on the Appwrite complaints collection (not required, no default). Every insert now writes correlativo_year, so until the attribute exists every new complaint fails with Unknown attribute a

### T07: Serve public product lookups from per-slug tagged caches with an active-category check, and serve category pages and navbar search from the cached catalog

**Observations:**
- SEC:catalog:findActiveJoinedBySlug:missing-active-category-filter
- SEC:catalogo-slug-route:uncached-join-before-category-check
- SEC:catalog:searchProducts:uncached-listActiveJoined-fanout
- GEN:performance:Category page fetches its products with no cache, in a 3-step Appwrite chain, on every request
- GEN:performance:Navbar search runs an uncached full Appwrite catalog scan on every debounced keystroke
- GEN:architecture-security:Public searchProducts action skips the cache and fans out to Appwrite on every call
- SEC-H:[h12-wildcard] product detail page calls uncached getProductBySlug before checking the route category against the cached active-category list
- SEC-H:[h14-slug-route-amplification] wrap getProductBySlug in React cache() or unstable_cache
- SEC-H:[h14-slug-route-amplification] resolve categoria against cached getCategories() and notFound() before getProductBySlug
- SEC-H:[h14-slug-route-amplification] slug and categoria segments have no length or charset bound
- SEC-H:[h14-slug-route-amplification] fetchRelated performs unbounded listAll scans of colors and flower_types on every single-product join
- SEC-H:[h08-public-catalog] searchProducts accepts any serialized argument type and length
- SEC-H:[h08-public-catalog] product page generateMetadata and ProductoPage both call getProductBySlug without React cache()
- SEC-H:[h08-public-catalog] /catalogo/[categoria] runs an uncached listActiveJoinedByCategorySlug plus joinProducts per request

**Approach:** getProducts() (queries/getProducts.ts:7-11) is unstable_cache with tag 'catalog-products'. getProductBySlug, getProductsByCategory and searchProducts bypass that cache, and findActiveJoinedBySlug has no category check. Detail pages do not read from the single whole-catalog cache entry: the Next data cache refuses entries over about 2 MB, and if that entry overflowed, every detail request would degrade to a full scan. (1) getProductBySlug = React cache(async (slug) => {...}). Inside, a per-slug unstable_cache((s) => productsRepository.findActiveJoinedBySlug(s), ['catalog-product'], { tags: ['catalog-products'], revalidate: 3600 }) is called with slug, so each entry stays small. Afterwards, return the product only if its categoryId is in the cached getCategories() active list, else null. The check sits outside the per-slug cache, so deactivating a category takes effect on the categories tag. (2) getProductsByCategory(slug): find the category in getCategories(), then filter getProducts() by categoryId, with no Appwrite request on the page path. (3) The product page, in both generateMetadata and the page, rejects categoria or slug that do not match ^[a-z0-9-]{1,120}$, and checks that categoria is in getCategories() before calling getProductBySlug; otherwise notFound() or the not-found metadata. Keep dynamicParams on, because products published after the build must render. (4) searchProducts runs z.string().trim().min(1).max(100).safeParse(query), returns [] on failure, and then filters getProducts() and getCategories(). (5) Delete listActiveJoinedByCategorySlug from the repository, its types and its tests after an rg check. Keep findActiveJoinedBySlug, which now runs only on a per-slug cache refill. Confirm with rg that every admin product write path calls updateTag or revalidateTag('catalog-products').

**Files:** `src/features/catalog/queries/getProductBySlug.ts`, `src/features/catalog/queries/getProductBySlug.test.ts`, `src/features/catalog/queries/getProductsByCategory.ts`, `src/features/catalog/queries/getProductsByCategory.test.ts`, `src/features/catalog/actions/searchProducts.ts`, `src/features/catalog/actions/searchProducts.test.ts`, `src/app/(public)/catalogo/[categoria]/[slug]/page.tsx`, `src/app/(public)/catalogo/[categoria]/page.tsx`, `src/lib/database/repositories/products/appwriteRepository.ts`, `src/lib/database/repositories/products/types.ts`, `src/lib/database/repositories/products/appwriteRepository.test.ts`

**New files allowed in:** `src/features/catalog/queries`, `src/features/catalog/actions`

**Test plan:** RED/GREEN with vitest. Mock next/cache so that unstable_cache records its keyParts and options and calls through; mock the products and categories repositories. getProductBySlug.test.ts: a product whose category is inactive returns null (RED: findActiveJoinedBySlug ignores the category), and unstable_cache is called with tags ['catalog-products']. Do not assert React cache() dedupe, because cache is a passthrough outside react-server. getProductsByCategory.test.ts: no repository list call beyond getProducts and getCategories. searchProducts.test.ts: a non-string or 1 MB argument returns [] without touching the repository (RED: it throws a TypeError or scans), and a normal query filters by name and caps the result at 12.

**Acceptance:**
- A product in an inactive category returns null and 404s
- An invalid categoria or slug segment returns notFound before any repository call
- Category pages and search make no uncached Appwrite list call
- searchProducts rejects non-string and over-100-character input
- listActiveJoinedByCategorySlug is removed

**Checks:** `npm run lint:strict`, `npx tsc --noEmit`, `npx vitest run`, `rg -n "listActiveJoinedByCategorySlug" src (expect no match)`

**Risk:** Low-medium. A product that is published or edited appears on its detail page only after the 'catalog-products' tag is revalidated, which the admin actions already do. Category pages and search still read the whole-catalog entry that /catalogo already uses; if it ever exceeds the roughly 2 MB data-cache limit, Next logs 'items over 2MB can not be cached' and falls back to a per-request scan. The console checklist watches for that warning.

**Commit:** `fix(catalog): serve public product lookups from tagged caches`

**Evidence:** RED (npx vitest run src/features/catalog, before implementation): 10 failed | 6 passed, plus resolveProductRoute.test.ts failed to import (module missing). searchProducts: "TypeError: query.trim is not a function" for number/object, "Cannot read properties of null (reading 'trim')" for null, and lis | checks: npm run lint:strict: 9 errors, 0 warnings, all the known tests/*.spec.ts no-empty; npx tsc --noEmit: passed, no output; npx vitest run: Test Files 37 passed (37), Tests 436 passed (436); rg -n "listActiveJoinedByCategorySlug": no match (exit 1); npx react-doctor@latest --verbose: Score 100/100, no issues found; security-review self-check (inline,: no HIGH/MEDIUM findings; verified admin product and category | verifier pass, tier medium | deploy: No schema or console changes are needed. Product detail pages are served from per-slug unstable_cache entries (key 'catalog-product' + slug, tag 'catalog-products', revalidate 3600). Edits show up after the admin actions' existing updateTag('catalog-products'). Deactivating a category takes effect t

### T08: Restrict admin-entered links and map embeds to safe destinations

**Observations:**
- SEC-H:[h07-rendering] hero and promo ctaValue and discover tile href accept javascript:, data: and vbscript:
- SEC-H:[h07-rendering] mapsEmbedUrl stored as any http(s) URL and framed with allow-scripts, allow-popups-to-escape-sandbox and allow-forms; frame-src only Report-Only
- SEC-H:[h07-rendering] value-prop hrefs are re-bound with free-text settings values and can become protocol-relative
- SEC-H:[h07-rendering] AnnouncementBar chooses <a> vs next/link with startsWith('http'); keep the schema coupling explicit
- SEC-H:[h07-rendering] JsonLd escapes only '<'
- SEC-H:[h05-admin-storage-fetch] saveSiteSettings short-link resolution uses redirect:'follow'
- SEC-H:[h05-admin-storage-fetch] isAllowedMapsHost accepts any *.google.com subdomain and broad google.com.xx / google.co.xx names
- SEC-H:[h13-stored-image-urls] discoverTile.ts isPublicSiteImagePath accepts '/\host/x' and control-character variants

**Approach:** (1) New src/lib/safeHref.ts with isSafeSiteHref(value). It accepts a '/' path that does not start with '//' and has no backslash or control character, a '#fragment', or a parseable https: URL with a hostname, and rejects everything else. It also exports isExternalHttpsHref. Use it in heroSlide.ts:51-58 and promoBanner.ts:48-55 (URL-type ctaValue) and discoverTile.ts:48 (href), in place of the bare new URL() checks. (2) isPublicSiteImagePath (discoverTile.ts:8) becomes ^/images/[A-Za-z0-9/_.-]+$, rejecting any '..'. (3) valuePropIdentity.ts:101-128 re-validates the interpolated href with isSafeSiteHref and falls back to the un-interpolated stored href when the check fails. (4) AnnouncementBar.tsx:168 uses isExternalHttpsHref. (5) The siteSettings schema's mapsEmbedUrl is refined with toMapsEmbedUrl(value) !== null and transformed to its output, so only Google embed URLs are stored. (6) mapsEmbed.ts isAllowedMapsHost uses an exact allowlist: google.com, www.google.com, maps.google.com, www.google.com.pe, maps.app.goo.gl and goo.gl. (7) In actions/siteSettings.ts, fetchMapsShortLink follows redirects in a redirect:'manual' loop of at most 5 hops, and every Location must be https and on an allowed host. (8) The ContactMap.tsx sandbox keeps allow-scripts, allow-same-origin and allow-popups, and drops allow-popups-to-escape-sandbox and allow-forms. (9) Extract the JsonLd serializer into src/lib/jsonLd.ts as serializeJsonLd, which additionally escapes '>', '&', U+2028 and U+2029 as JSON unicode escapes; JsonLd.tsx uses it.

**Files:** `src/lib/safeHref.ts`, `src/lib/safeHref.test.ts`, `src/lib/mapsEmbed.ts`, `src/lib/mapsEmbed.test.ts`, `src/lib/jsonLd.ts`, `src/lib/jsonLd.test.ts`, `src/lib/valuePropIdentity.ts`, `src/features/admin/schemas/heroSlide.ts`, `src/features/admin/schemas/heroSlide.test.ts`, `src/features/admin/schemas/promoBanner.ts`, `src/features/admin/schemas/promoBanner.test.ts`, `src/features/admin/schemas/discoverTile.ts`, `src/features/admin/schemas/discoverTile.test.ts`, `src/features/admin/schemas/siteSettings.ts`, `src/features/admin/schemas/siteSettings.test.ts`, `src/features/admin/actions/siteSettings.ts`, `src/features/landing/components/ContactSection/ContactMap.tsx`, `src/components/shared/Navbar/AnnouncementBar.tsx`, `src/components/ui/JsonLd.tsx`

**New files allowed in:** `src/lib`, `src/features/admin/schemas`

**Test plan:** RED/GREEN with vitest. safeHref.test.ts: javascript:, data:, vbscript:, //evil, a backslash path, a path with a tab, and http: are rejected; https:, / and # are accepted. heroSlide.test.ts and promoBanner.test.ts: a javascript: ctaValue is rejected. discoverTile.test.ts: '/\evil.com/x' is rejected (RED today). siteSettings.test.ts: a non-Google mapsEmbedUrl is rejected and a valid one is transformed. mapsEmbed.test.ts: isAllowedMapsHost('evil.google.com') is false, and toMapsEmbedUrl still accepts the current BUSINESS.mapsEmbedUrl. jsonLd.test.ts: '</script>', '>', '&', U+2028 and U+2029 are escaped and the output still round-trips through JSON.parse. Check the iframe sandbox manually in npm run dev: the map pans and the 'open in Maps' link still works.

**Acceptance:**
- javascript:, data: and vbscript: hrefs are rejected by every admin link schema
- isAllowedMapsHost is an exact allowlist
- Short-link resolution never follows more than 5 hops or a non-https or non-allowlisted Location
- The ContactMap sandbox omits allow-popups-to-escape-sandbox and allow-forms
- serializeJsonLd escapes <, >, &, U+2028 and U+2029

**Checks:** `npm run lint:strict`, `npx tsc --noEmit`, `npx vitest run`

**Risk:** Medium. Stricter schemas reject edits to existing CMS records that hold now-invalid hrefs: the owner sees validation errors on the next save, but published content is not rewritten. Narrowing the maps hosts may reject pastes from other regional Google domains.

**Commit:** `fix(admin): restrict admin links and map embeds to safe targets`

**Evidence:** RED: I wrote the tests first and ran them before implementing. Result: 31 failed tests, plus 3 test files that could not load because the modules did not exist yet (./safeHref, ./jsonLd, ./mapsShortLink).
- mapsEmbed.test: isAllowedMapsHost wrongly returned true for evil.google.com, sites.google.com | checks: npm run lint:strict: 9 problems (9 errors, 0 warnings), all in the 4 known tests/; npx tsc --noEmit: exit 0, no errors; npx vitest run: Test Files 46 passed (46); Tests 551 passed (551); npx react-doctor@latest --verbose: With allow-same-origin in the sandbox: 84/100 and 1 new ifra; security-review self-check of: No high-confidence findings. | verifier pass, tier medium | deploy: No schema, console or env changes. Stored CMS records with now-invalid values are not rewritten; the owner sees validation errors the next time they save them:
- hero and promo ctaValue that is http:, a path or a non-https scheme;
- discover tile hrefs outside the safe set;
- discover images outside

### T09: Codify least-privilege Appwrite ACLs and the private-collection schema in the provisioning scripts

**Observations:**
- SEC:scripts/provision-home-content.mjs:CONTENT_PERMISSIONS:read-any-bypasses-isPublished
- SEC-H:[h10-appwrite-acl] provision-home-content.mjs grants create/update/delete to Role.team('admins') on all CMS collections
- SEC-H:[h10-appwrite-acl] ACLs for complaints, counters, catalog collections and image buckets are not codified in the repo
- SEC-H:[h15-complaints-acl] add a source-controlled provisioning step for complaints and counters with empty permissions and documentSecurity false

**Approach:** The app reads and writes every collection through the API key (src/lib/appwrite/admin.ts), so collection-level client grants serve no purpose. (1) In scripts/provision-home-content.mjs, set CONTENT_PERMISSIONS for the six CMS collections to [] with documentSecurity false, removing read(any) and the admins-team writes. Keep read(any) on the content_images bucket, because browsers load /view URLs directly. (2) Add scripts/provision-private-collections.mjs. It is idempotent and dry-run by default, printing current versus desired $permissions, documentSecurity, attributes and indexes; --apply applies the changes. It covers complaints (and creates the integer attribute 'correlativo_year' when missing, for T06), counters, rate_limits (creates the collection, the integer 'count', the datetime 'expires_at' and a key index on expires_at when missing, for T04), and the catalog collections (products, categories, product_images, colors, flower_types, color_assignments and flower_type_assignments), all with [] permissions. It sets the product_images and category_images buckets to file read(any) only. It reads APPWRITE_* from env like the existing script and waits for attribute availability before creating an index. It never deletes data or attributes. The agent never runs it; only the owner does.

**Files:** `scripts/provision-home-content.mjs`, `scripts/provision-private-collections.mjs`

**New files allowed in:** `scripts`

**Test plan:** No vitest: the scripts live outside src/** and need a live Appwrite project. The proportional checks are node --check on both scripts and a review of the dry-run diff logic. The owner runs the dry-run first, ideally against a non-production project, and then --apply.

**Acceptance:**
- Both scripts pass node --check
- The private-collections script defaults to dry-run and mutates only with --apply
- The desired state includes rate_limits (count, expires_at, expires_at index) and complaints.correlativo_year
- No bucket loses file read(any); no script deletes documents or attributes

**Checks:** `npm run lint:strict`, `npx tsc --noEmit`, `npx vitest run`, `node --check scripts/provision-home-content.mjs`, `node --check scripts/provision-private-collections.mjs`

**Risk:** High if applied wrongly: removing read(any) from an image bucket would break every public image. The script defaults to dry-run, and buckets keep read(any) by design. The code changes alone have no runtime effect.

**Deploy steps (owner):**
- Owner: run both scripts as a dry-run, review the diff, then run them with --apply (see console checklist).

**Commit:** `chore(scripts): codify least-privilege Appwrite provisioning`

**Evidence:** No meaningful vitest RED exists, as the task's test plan says. The scripts live outside src/** and need a live Appwrite project. Instead I ran a throwaway smoke harness, kept in the scratchpad and not committed, that loads scripts/lib/appwrite-provisioning.mjs against fake Databases/Storage clients. | checks: npm run lint:strict: Exit 1 with only the 9 known errors in tests/*.spec.ts (cata; npx tsc --noEmit: exit 0, no errors; npx vitest run: 46 files, 551 tests passed; node --check scripts/provision-home-content.mjs: OK; node --check scripts/provision-private-collections.mjs: OK (scripts/lib/appwrite-provisioning.mjs also passes node - | verifier pass, tier medium | deploy: Owner only. With APPWRITE_* set, run `node scripts/provision-home-content.mjs` and `node scripts/provision-private-collections.mjs` as dry-runs, ideally against a non-production project first, and review the printed current -> desired diffs. Then re-run each with --apply. Breaking change for anyone 

### T10: Fix lint:strict errors in e2e specs and the stale production host in SEO guard tests

**Observations:**
- GEN:host-checks:npm run lint:strict fails with 9 errors in tests/*.spec.ts (empty arrow functions / empty block)
- GEN:host-checks:tests/phase1-verify.spec.ts asserts the old host kataleya-flawers.appwrite.network
- GEN:seo:SEO guard tests point at the old host and miss key cases (stale since the domain change)

**Approach:** Verified on the host: eslint reports @typescript-eslint/no-empty-function at catalog-taxonomy-baseline.spec.ts:62,154,209, category-page.spec.ts:58,111 and product-detail.spec.ts:29,82, plus no-empty at seo-metadata.spec.ts:22 and no-empty-function at seo-metadata.spec.ts:61. (1) Replace `.catch(() => {})` on the waitForFunction calls with `.catch(() => null)`. These are intentional best-effort waits, and comments are allowed in tests/. (2) Give the empty catch at seo-metadata.spec.ts:22 an explicit `continue`. (3) In phase1-verify.spec.ts:67,75,84,144,145, derive the expected host from new URL(process.env.E2E_SITE_URL ?? 'https://www.kataleyaflowers.com').host instead of the hardcoded appwrite.network host, and add per-route canonical assertions for /, /catalogo and one category. T18 adds the noindex and sitemap assertions, and T20 adds the Florist assertion. Do not run Playwright.

**Files:** `tests/catalog-taxonomy-baseline.spec.ts`, `tests/category-page.spec.ts`, `tests/product-detail.spec.ts`, `tests/seo-metadata.spec.ts`, `tests/phase1-verify.spec.ts`

**Test plan:** No vitest applies: these are Playwright specs, and running them is forbidden because they hit production. RED is the current lint:strict failure (9 errors), and GREEN is lint:strict passing. `npx playwright test --list` checks that the specs still compile and load without making network calls.

**Acceptance:**
- lint:strict reports 0 errors in tests/
- No spec references kataleya-flawers.appwrite.network
- npx playwright test --list succeeds

**Checks:** `npm run lint:strict`, `npx tsc --noEmit`, `npx vitest run`, `npx playwright test --list`, `rg -n "appwrite.network" tests (expect no match)`

**Risk:** Low. The e2e assertions stay unverified until the owner runs the suite.

**Commit:** `test(e2e): fix lint errors and stale host in SEO guards`

**Evidence:** No vitest applies (Playwright specs; running them is forbidden). RED: `npm run lint:strict` failed with 9 errors (no-empty-function at catalog-taxonomy-baseline.spec.ts:62,154,209, category-page.spec.ts:58,111, product-detail.spec.ts:29,82, seo-metadata.spec.ts:61; no-empty at seo-metadata.spec.ts:2 | checks: npm run lint:strict: exit 0, 0 errors/0 warnings; npx tsc --noEmit: exit 0; npx vitest run: 46 files / 551 tests passed; npx playwright test: exit 0, Total: 98 tests in 16 files; rg -n "appwrite.network": no match (exit 1) | verifier pass, tier medium | deploy: No deploy steps. The e2e assertions stay unverified until the owner runs the suite against the site. If the target environment's site settings `website` differs from www.kataleyaflowers.com, set E2E_SITE_URL to match, because canonical, og:url and sitemap URLs come from settings.website.

### T11: Add a CI gate (lint, typecheck, unit tests) with a test that every admin Server Action enforces auth, and pin the workflow supply chain

**Observations:**
- GEN:architecture-security:Critical flows have no unit coverage, and CI runs no lint, typecheck or tests
- SEC-H:[h11-supply-chain] pin millionco/react-doctor to a full commit SHA and set its version input to an exact release
- SEC-H:[h11-supply-chain] pin actions/checkout to a commit SHA and set persist-credentials: false
- SEC-H:[h11-supply-chain] narrow the workflow-level permissions to a job-level block and drop issues: write
- SEC-H:[h11-supply-chain] package.json doctor (npx react-doctor@latest) and test:e2e (npx playwright test) fetch or run unpinned tooling

**Approach:** The only workflow is the advisory react-doctor.yml. Its permissions are workflow-level (lines 17-21), it uses actions/checkout@v5 and millionco/react-doctor@v2 by tag, and its version defaults to latest. (1) New .github/workflows/ci.yml on pull_request and on push to main. It sets job-level permissions contents: read, pins actions/checkout to a commit SHA with persist-credentials: false, and pins actions/setup-node to a SHA with node 20 and the npm cache. It then runs npm ci, npm run lint:strict, npx tsc --noEmit and npx vitest run. Resolve the SHAs with gh api; never invent them. (2) react-doctor.yml: move permissions to the job (contents: read, pull-requests: write, statuses: write; drop issues: write unless the action docs require it), pin both actions to SHAs, set persist-credentials: false and set `version:` to an exact react-doctor release. (3) package.json scripts: doctor becomes `npx react-doctor@<exact version>`, and test:e2e becomes `playwright test`, the local devDependency binary. (4) New src/features/admin/actions/adminActionsAuth.test.ts. It enumerates src/features/admin/actions/*.ts with fs plus import.meta.glob or a static import list, and keeps only modules whose first statement is 'use server', excluding auth.ts; it also includes src/features/complaints/actions/updateComplaint.ts. vi.mock('@/lib/auth') so requireAdmin throws AuthError UNAUTHENTICATED and then FORBIDDEN. Mock next/cache and every repository so that any call fails the test. Every exported async function must return { success:false, code } with that code and call no repository. Plain helper modules, such as T29's helper under admin/utils, are never in scope.

**Files:** `.github/workflows/ci.yml`, `.github/workflows/react-doctor.yml`, `package.json`, `src/features/admin/actions/adminActionsAuth.test.ts`

**New files allowed in:** `.github/workflows`, `src/features/admin/actions`

**Test plan:** vitest: adminActionsAuth.test.ts is a guard test and is GREEN on arrival, because every action already calls requireAdmin. Prove it can fail by locally removing requireAdmin from one action (RED) and then reverting; do not commit that step. Check the workflow YAML structurally, and with actionlint if the owner has it. The workflow proves itself on its first run.

**Acceptance:**
- ci.yml runs lint:strict, tsc and vitest with job-level contents: read and SHA-pinned actions
- react-doctor.yml has job-level permissions, SHA-pinned actions and an exact version
- package.json doctor pins an exact version, and test:e2e uses the local playwright binary
- The guard test covers every 'use server' module in admin/actions except auth.ts, plus updateComplaint

**Checks:** `npm run lint:strict`, `npx tsc --noEmit`, `npx vitest run`, `rg -n "@v[0-9]|@latest" .github/workflows package.json (expect no unpinned action or tool)`

**Risk:** Low. CI would be red without T10, hence the dependency. Pinned SHAs need periodic manual bumps.

**Deploy steps (owner):**
- Owner: after merge, add a branch-protection rule on main requiring the new CI job.

**Commit:** `ci: add lint, typecheck and unit test gate with pinned actions`

**Evidence:** Guard test: no meaningful RED on arrival, because every action already calls requireAdmin. As planned, it went GREEN on first run: 95/95. That is 1 discovery test plus 47 exported actions × 2 auth codes.

Fault injection (each change reverted with git checkout, nothing committed):
(1) Removed `await | checks: npm run lint:strict: exit 0, no errors or warnings. The first run flagged 2 error; npx tsc --noEmit: exit 0, no output; npx vitest run: 47 files passed, 646 tests passed, exit 0; rg -n "@v[0-9]|@latest": no matches (exit 1): no unpinned action or tool; python yaml.safe_load structural: Both files parse. Top-level permissions are {} in both. ci.y; actionlint: not installed; skipped | verifier pass, tier high | deploy: - Owner: after merge, add a branch-protection rule on main that requires the new CI check "Lint, typecheck and unit tests" (workflow CI, job verify).
- Pinned action SHAs and react-doctor 0.9.23 need periodic manual bumps.
- The workflows prove themselves on their first run.

### T12: Remove binding-convention violations: the eslint-disable, production comments and the 550-line CatalogFilterSheet

**Observations:**
- GEN:architecture-security:Binding conventions are violated in src

**Approach:** (1) BestSellersTabs.tsx:31-38: the mount-only effect hides tabCategories behind an eslint-disable. Add tabCategories to the dependency array and delete the directive. The prop comes from a Server Component and its identity is stable per render, so behavior is unchanged. (2) Remove the comments in next.config.ts:4-17 and :42-66 and in submitComplaint.ts. Keep the functional react-doctor-disable directive, which AGENTS.md treats as a directive, not a comment. T05 already deleted proxy.ts. (3) Split src/features/catalog/components/CatalogFilterSheet.tsx, which holds 9 components, into the folder CatalogFilterSheet/. index.tsx is the orchestrator and default export, and re-exports the CatalogFilters and CatalogColorFacet types from types.ts. AccordionSection, OptionTile, AppliedChipsList, SortAccordion, CategoryAccordion, PriceAccordion, ColorAccordion and FlowerTypeAccordion get one file each. '@/features/catalog/components/CatalogFilterSheet' resolves to the folder index, so consumers do not change. This is a mechanical move with no markup changes.

**Files:** `src/features/landing/components/BestSellersSection/BestSellersTabs.tsx`, `next.config.ts`, `src/features/complaints/actions/submitComplaint.ts`, `src/features/catalog/components/CatalogFilterSheet.tsx`, `src/features/catalog/components/CatalogFilterSheet/index.tsx`, `src/features/catalog/components/CatalogFilterSheet/types.ts`, `src/features/catalog/components/CatalogFilterSheet/AccordionSection.tsx`, `src/features/catalog/components/CatalogFilterSheet/OptionTile.tsx`, `src/features/catalog/components/CatalogFilterSheet/AppliedChipsList.tsx`, `src/features/catalog/components/CatalogFilterSheet/SortAccordion.tsx`, `src/features/catalog/components/CatalogFilterSheet/CategoryAccordion.tsx`, `src/features/catalog/components/CatalogFilterSheet/PriceAccordion.tsx`, `src/features/catalog/components/CatalogFilterSheet/ColorAccordion.tsx`, `src/features/catalog/components/CatalogFilterSheet/FlowerTypeAccordion.tsx`

**New files allowed in:** `src/features/catalog/components/CatalogFilterSheet`

**Test plan:** No deterministic unit RED: this is a refactor with no behavior change, and vitest has no DOM environment (adding jsdom would be a new dependency). Structural checks: rg finds no eslint-disable in src, and no // or /* comments remain in the touched files. Lint, tsc and vitest stay green. Check the filter sheet on /catalogo manually in npm run dev.

**Acceptance:**
- No eslint-disable remains in src
- next.config.ts and submitComplaint.ts contain no comments other than the react-doctor directive
- CatalogFilterSheet.tsx is replaced by the folder, with one component per file
- Every consumer import path is unchanged

**Checks:** `npm run lint:strict`, `npx tsc --noEmit`, `npx vitest run`, `rg -n "eslint-disable" src (expect no match)`

**Risk:** Low. Moved lines dominate the diff, which exceeds the 400-line advisory because the split is one coherent unit. The main hazard is a missed prop or type re-export.

**Commit:** `refactor(catalog): split CatalogFilterSheet and drop convention violations`

**Evidence:** There is no deterministic unit RED, as the test plan expected. The change is a refactor that keeps behavior the same, and vitest has no DOM environment (adding jsdom would be a new dependency). The lint gate gave real RED evidence instead. Step (1) as planned added tabCategories to the deps array an | checks: npm run lint:strict: exit 0, 0 problems (after fix; the first run with only the d; npx tsc --noEmit: exit 0, no errors; npx vitest run: 47 test files passed, 646 tests passed, exit 0; rg -n "eslint-disable": no match (exit 1); npx react-doctor@latest --verbose: Full scope: 67/100 with 22 issues on both baseline and worki | verifier pass, tier medium | deploy: None. Only code and config comments changed, with no schema, env or console changes. The header and CSP values in next.config.ts are unchanged; only the comments were removed.

### T13: Load analytics only on public production pages, allow GA in the CSP, and move Toaster to the admin layout

**Observations:**
- GEN:performance:Google Analytics was added but the CSP does not allow it; it will break when CSP is enforced, and it also fires in dev/preview
- GEN:architecture-security:New Google Analytics loads everywhere, and the CSP does not account for it
- GEN:performance:Toaster (sonner) is mounted on every public page but only admin code calls toast
- SEC-H:[h09-platform-secrets] if the CSP is enforced, script-src/connect-src do not list googletagmanager / google-analytics
- SEC-H:[h10-appwrite-acl] GoogleAnalytics and Vercel Analytics in src/app/layout.tsx load on /admin routes as well

**Approach:** src/app/layout.tsx:117-121 renders Toaster, Analytics, SpeedInsights and GoogleAnalytics (a hardcoded G-YDFWMY50NN with no environment gate) on every route, and next.config.ts omits the GA origins. (1) Remove those four from the root layout. (2) src/app/(public)/layout.tsx renders <Analytics/> and <SpeedInsights/>, plus <GoogleAnalytics gaId={GA_MEASUREMENT_ID}/> only when process.env.VERCEL_ENV === 'production'. Move the GA id into src/lib/constants.ts. (3) src/app/(admin)/layout.tsx renders <Toaster/>; every toast caller lives under src/features/admin. (4) In next.config.ts CSP_REPORT_ONLY: script-src adds https://www.googletagmanager.com; connect-src adds https://*.google-analytics.com, https://*.analytics.google.com and https://www.googletagmanager.com; img-src adds https://*.google-analytics.com and https://www.googletagmanager.com. Keep the policy Report-Only (see not_fixing).

**Files:** `src/app/layout.tsx`, `src/app/(public)/layout.tsx`, `src/app/(admin)/layout.tsx`, `src/lib/constants.ts`, `next.config.ts`

**Test plan:** No deterministic unit test applies to layout composition. Proportional checks: rg shows <Toaster only in the (admin) layout and GoogleAnalytics only in the (public) layout behind the VERCEL_ENV gate. In npm run dev, a toast still appears on an admin save, and the Network tab shows no gtag request in development.

**Acceptance:**
- <Toaster appears only in src/app/(admin)/layout.tsx
- GoogleAnalytics renders only in the (public) layout and only when VERCEL_ENV is production
- The GA id is read from src/lib/constants.ts
- The CSP Report-Only header lists the GA and GTM origins in script-src, connect-src and img-src

**Checks:** `npm run lint:strict`, `npx tsc --noEmit`, `npx vitest run`, `rg -n "<Toaster|GoogleAnalytics" src/app`

**Risk:** Low. GA stops collecting preview and dev traffic, which is intended. /login loses Vercel Analytics, which is acceptable.

**Commit:** `perf(analytics): scope analytics to public production pages`

**Evidence:** No RED test: this exception matches the task's test plan. The change only moves components between layouts and adds a static CSP header, and no meaningful vitest test can render Next.js App Router layouts together or read VERCEL_ENV at render time. I ran the proportional checks instead. rg shows <To | checks: npm run lint:strict: exit 0, no warnings; npx tsc --noEmit: exit 0, no errors; npx vitest run: 47 files / 646 tests passed, exit 0; rg -n "<Toaster|GoogleAnalytics": src/app/(admin)/layout.tsx:25 <Toaster />; src/app/(public)/; npx react-doctor@latest --verbose: Score 88/100. 7 warnings, all in files changed by earlier co | verifier pass, tier medium | deploy: No deploy steps. GA now collects only when Vercel sets VERCEL_ENV=production, so dev and preview traffic stops reaching GA. The CSP stays Report-Only, and it now lists googletagmanager.com in script-src; *.google-analytics.com, *.analytics.google.com and googletagmanager.com in connect-src; and *.go

### T14: Prerender catalog pages, sync filters with history.replaceState, and render every product link in server HTML

**Observations:**
- GEN:performance:Catalog pages are dynamic per request (searchParams), so revalidate/generateStaticParams do nothing, and each filter click causes a full server re-render
- GEN:seo:Product grids put only 10 product links in the server HTML; the rest load on scroll through IntersectionObserver
- GEN:performance:Catalog card `sizes` ignores the selected density, so images are undersized at 2 columns and oversized at 4
- GEN:performance:`priority` (deprecated in Next 16) is preloading 4 catalog images even on 1-column mobile
- GEN:a11y-ux:Full-bleed w-screen sections likely cause horizontal page scroll on desktop browsers with classic scrollbars

**Approach:** catalogo/page.tsx:62-110 and [categoria]/page.tsx:19,87-92 await searchParams only to build initialQuery. CatalogCollection.tsx:163 calls router.replace on every filter change, and :218-241 reveals 10 items at a time. (1) The pages stop reading searchParams and drop the initialQuery prop, so revalidate and generateStaticParams take effect. (2) New pure src/features/catalog/utils/catalogQuery.ts with parseCatalogQuery(search, facets) and serializeCatalogQuery(state), taking over parseList and parsePrice from CatalogCollection. (3) CatalogCollection reads location.search through useSyncExternalStore (server snapshot ''). Once the client snapshot differs, it seeds filters, sort and density with the adjust-state-during-render pattern it already uses for resetKey. It writes with window.history.replaceState(null, '', url) instead of router.replace. (4) Render every item card: drop PAGE_SIZE and the IntersectionObserver. Below-the-fold images stay loading=lazy, so every product link is crawlable. (5) Pass density-derived sizes to CatalogCollectionCard: (max-width:640px) 100vw, (max-width:1024px) 50vw, then 50vw, 33vw or 25vw for density 2, 3 or 4. (6) Replace priority with preload on the first card only, and loading='eager' on cards 2 and 3. Use preload on the main image in ProductGallery.tsx:80, and remove priority from LightboxDialog.tsx:138 and NotFoundContent.tsx:22. (7) Add overflow-x-clip (which keeps position: sticky working) on the <main> of both catalog pages.

**Files:** `src/app/(public)/catalogo/page.tsx`, `src/app/(public)/catalogo/[categoria]/page.tsx`, `src/features/catalog/components/CatalogCollection.tsx`, `src/features/catalog/components/CatalogCollectionCard.tsx`, `src/features/catalog/utils/catalogQuery.ts`, `src/features/catalog/utils/catalogQuery.test.ts`, `src/features/catalog/components/ProductGallery.tsx`, `src/components/ui/LightboxDialog.tsx`, `src/components/shared/NotFoundContent.tsx`, `src/features/admin/components/HeroCanvasEditor/Canvas.tsx`

**New files allowed in:** `src/features/catalog/utils`

**Test plan:** RED/GREEN with vitest on the extracted pure functions. Write catalogQuery.test.ts first: parse and serialize round trips, invalid values (an unknown category, a NaN price, density 5), and clamping to maximumPrice. Check the component wiring manually in npm run dev: a deep link such as /catalogo?color=rojo&densidad=2 applies its filters after hydration, filter clicks send no RSC request (Network tab), and view-source contains every product link. Confirm the ISR marker only if the owner allows a local build.

**Acceptance:**
- Neither catalog page reads searchParams
- A filter change makes no RSC request and updates the URL through replaceState
- The server HTML contains a link for every product in the grid
- No priority prop remains in src; exactly one catalog card preloads
- sizes reflects the selected density

**Checks:** `npm run lint:strict`, `npx tsc --noEmit`, `npx vitest run`, `rg -n "\bpriority\b" src --glob '*.tsx' (expect no next/image priority prop)`

**Risk:** Medium. Deep links with filters render unfiltered HTML first and apply the filters on the client, so there is a brief flash. Rendering every card raises DOM size as the catalog grows.

**Commit:** `perf(catalog): prerender catalog pages and sync filters client-side`

**Evidence:** RED: I wrote src/features/catalog/utils/catalogQuery.test.ts first (13 tests: parse defaults, all params, no leading '?', unknown category/color/type dropped, NaN price + unknown sort + density 5 fall back to defaults, clamping to [0, maximumPrice], serialize default -> '', round trip, unrelated par | checks: npm run lint:strict: exit 0, no warnings (the first run flagged simple-import-sor; npx tsc --noEmit: exit 0; npx vitest run: 48 files, 659 tests passed; rg -n "\bpriority\b": no matches (exit 1); npx react-doctor@latest --verbose: Same 7 warnings in the same 6 files before and after, and di | verifier pass, tier medium | surface extended: 1) `initialQuery` stays on CatalogCollection as an optional prop and seeds state on the server, instead of being deleted | deploy: No schema or console change is needed. /catalogo and /catalogo/[categoria] should now prerender as ISR (revalidate 3600 plus generateStaticParams). I did not confirm this because no local build ran. Known risk: a deep link with filters renders unfiltered HTML first and applies the filters on the cli

### T15: Send slim card DTOs to client components and compute best sellers on the server

**Observations:**
- GEN:performance:Landing page sends the whole product catalog to a client component that shows 4 cards

**Approach:** BestSellersSection/index.tsx:11,28-32 passes every Product to the client BestSellersTabs, which runs pickBestSellers (max 4) on the client. CatalogCollection also receives full Products, although the cards read only name, slug, imageUrl, price and priceTable. (1) Add a CatalogCardProduct type in src/features/catalog/types/index.ts with id, name, slug, categoryId, imageUrl, price, priceTable, colors, flowerTypes and isFeatured, plus a toCatalogCardProduct mapper. It omits description, images, includes, note and occasion. (2) BestSellersSection computes bestSellersByTab: Record<'all' | categoryId, CatalogCardProduct[]> on the server, applying pickBestSellers per tab, and passes only that map and tabCategories. BestSellersTabs only switches tabs, and BestSellerProductCard takes CatalogCardProduct. (3) The catalog pages, the /buscar page and SearchPage map items to CatalogCardProduct before they cross into CatalogCollection or CatalogCollectionCard. applySearchQuery's CatalogCollectionItem typing follows. The related-products carousel in [slug]/page.tsx also takes CatalogCardProduct. Surface extension under the user standing authorization (goal: finish all 32): getSearchSuggestions.ts and SearchSuggestionsPanel.tsx, so the navbar suggestions also receive slim CatalogCardProduct DTOs.

**Files:** `src/features/catalog/types/index.ts`, `src/features/catalog/utils/pickBestSellers.ts`, `src/features/catalog/utils/pickBestSellers.test.ts`, `src/features/landing/components/BestSellersSection/index.tsx`, `src/features/landing/components/BestSellersSection/BestSellersTabs.tsx`, `src/features/landing/components/BestSellersSection/BestSellerProductCard.tsx`, `src/app/(public)/catalogo/page.tsx`, `src/app/(public)/catalogo/[categoria]/page.tsx`, `src/app/(public)/catalogo/[categoria]/[slug]/page.tsx`, `src/app/(public)/buscar/page.tsx`, `src/features/catalog/components/CatalogCollection.tsx`, `src/features/catalog/components/CatalogCollectionCard.tsx`, `src/features/catalog/components/SearchPage/index.tsx`, `src/features/catalog/components/SearchPage/applySearchQuery.ts`, `src/features/catalog/actions/getSearchSuggestions.ts`, `src/components/shared/Navbar/SearchOverlay/SearchSuggestionsPanel.tsx`

**New files allowed in:** `src/features/catalog/utils`

**Test plan:** RED/GREEN with vitest. pickBestSellers.test.ts covers the new buildBestSellersByTab(products, tabCategories): at most 4 per tab, the 'all' tab included, and output objects with no description or images keys. The proportional check is the RSC payload size before and after, read from view-source in npm run dev.

**Acceptance:**
- BestSellersTabs receives only the per-tab map of at most 4 CatalogCardProduct items each
- No client component receives description, images, includes, note or occasion
- /buscar still renders results and filters

**Checks:** `npm run lint:strict`, `npx tsc --noEmit`, `npx vitest run`

**Risk:** Low-medium. Type churn across the card consumers, including /buscar.

**Commit:** `perf(catalog): send slim card DTOs to client components`

**Evidence:** RED: I added a pickBestSellerCards describe block (2 tests) to src/features/catalog/utils/pickBestSellers.test.ts. Running `npx vitest run src/features/catalog/utils/pickBestSellers.test.ts` gave "TypeError: pickBestSellerCards is not a function": Tests 2 failed | 6 passed (8). GREEN: I implemented  | checks: npm run lint:strict: exit 0, no warnings or errors (eslint . --max-warnings 0); npx tsc --noEmit: exit 0, no output; npx vitest run: 49 test files passed, 667 tests passed; npx react-doctor@latest --verbose: score 87. 7 warnings, all in files outside this commit (Cata | verifier pass, tier medium | deploy: None. No schema, console or env changes.

### T16: Lazy-load navbar overlays and load Framer Motion features asynchronously

**Observations:**
- GEN:performance:Framer Motion features and the full Navbar overlay tree load eagerly on every public page

**Approach:** Navbar/index.tsx:9-13 statically imports CatalogMenu, SearchOverlay and MobileDrawer, and CatalogMenu/index.tsx, SearchOverlay/index.tsx and SearchSuggestionsPanel.tsx each import domAnimation statically. (1) Load the three overlays with next/dynamic({ ssr: false }) and render each only after it first opens, keeping a hasOpened flag so closing animations still run. Prefetch on pointerenter or focus of their triggers by calling the dynamic import. (2) New src/components/shared/motionFeatures.ts default-exports domAnimation. Each LazyMotion uses features={() => import('@/components/shared/motionFeatures').then((m) => m.default)}, which keeps the LazyMotion + m rule. Surface extended under the user standing authorization: src/features/landing/components/BestSellersSection/BestSellersTabs.tsx, src/components/ui/LightboxDialog.tsx.

**Files:** `src/components/shared/Navbar/index.tsx`, `src/components/shared/Navbar/CatalogMenu/index.tsx`, `src/components/shared/Navbar/SearchOverlay/index.tsx`, `src/components/shared/Navbar/SearchOverlay/SearchSuggestionsPanel.tsx`, `src/components/shared/motionFeatures.ts`, `src/features/landing/components/BestSellersSection/BestSellersTabs.tsx`, `src/components/ui/LightboxDialog.tsx`

**New files allowed in:** `src/components/shared`

**Test plan:** No deterministic unit test: this is bundling behavior, and vitest has no DOM. Run npm run doctor for the bundle signal. In npm run dev, confirm that each overlay opens and animates on first use, and that the Network tab shows the chunk loading on hover or open.

**Acceptance:**
- CatalogMenu, SearchOverlay and MobileDrawer load through next/dynamic
- No component imports domAnimation statically except motionFeatures.ts
- Each overlay opens and closes with its animation in dev

**Checks:** `npm run lint:strict`, `npx tsc --noEmit`, `npx vitest run`, `npm run doctor`, `rg -n "domAnimation" src (expect only motionFeatures.ts and MotionProvider if any)`

**Risk:** Low-medium. On a slow network, the first open may lag if the prefetch does not fire. T25 must account for the deferred mount.

**Commit:** `perf(navbar): lazy-load overlays and motion features`

**Evidence:** No meaningful RED is possible. This change is about how code is bundled and loaded, and vitest runs without a DOM, so no deterministic unit test can observe it. I ran the proportional checks instead: lint, tsc, vitest, react-doctor, and the rg check for domAnimation. I did not do the in-browser dev  | checks: npm run lint:strict: exit 0, no warnings; npx tsc --noEmit: exit 0; npx vitest run: 49 files, 667 tests passed; npm run doctor: exit 1, score 67/100. The 2 errors are both react-doctor/eff; npx react-doctor@0.9.23 --verbose: exit 0, score 87/100. 7 warnings, all in files outside this ; rg -n "domAnimation": Only src/components/shared/motionFeatures.ts (lines 1 and 3) | verifier pass, tier medium | surface extended: 1. I reused the previous writer's uncommitted in-surface work as it was.
2. Under the extended surface, I applied the sa | deploy: No deploy steps. One risk: useMobileDrawer focuses the search input 150 ms after the drawer opens. If the drawer chunk was not prefetched and loads slower than that on the first open, the input does not get focus. Radix still moves focus into the dialog when it mounts. T25 has to account for overlay

### T17: Route local public images through the built-in optimizer instead of the passthrough loader

**Observations:**
- GEN:performance:Local raster images skip resizing because the custom loader passes them through; the footer ships a 145 KB PNG to show it at 90px

**Approach:** StoredImage.tsx:8 always applies storedImageLoader, and imageLoader.ts returns non-Appwrite src unchanged, so /libro-reclamaciones-indecopi.png (762x454, 145 KB, shown at sizes=90px) and the /images fallback JPEGs ship at full size. Export isStoredImageSrc(src) from src/lib/imageLoader.ts. It uses only the config-free parseStorageViewPath from T03; StoredImage is a client component and must never touch getAppwriteConfig or server env. StoredImage passes loader={storedImageLoader} only when isStoredImageSrc(src) is true. Otherwise it omits the loader, so the default next/image optimizer resizes local files and serves them as AVIF or WebP. No binary assets change.

**Files:** `src/components/ui/StoredImage.tsx`, `src/lib/imageLoader.ts`, `src/lib/imageLoader.test.ts`

**Test plan:** RED/GREEN with vitest. Write the imageLoader.test.ts cases first (RED: the function does not exist): isStoredImageSrc is true for a canonical Appwrite view URL and false for '/libro-reclamaciones-indecopi.png', '/images/hero/rosas.jpg' and a query-decoy URL. Run the tests with no APPWRITE_* env set. Check manually in dev that the footer badge request is a /_next/image?w= URL.

**Acceptance:**
- Local images are served through /_next/image
- Appwrite images still go through the /preview loader
- imageLoader.ts does not import src/lib/appwrite/config.ts

**Checks:** `npm run lint:strict`, `npx tsc --noEmit`, `npx vitest run`

**Risk:** Low. It spends a little of the Vercel image optimization quota on a few static assets.

**Commit:** `perf(images): optimize local public images with next/image`

**Evidence:** RED: added isStoredImageSrc/isLocalAssetSrc cases to src/lib/imageLoader.test.ts (APPWRITE_* stubbed empty); `npx vitest run src/lib/imageLoader.test.ts` -> 13 failed | 5 passed, "TypeError: isStoredImageSrc is not a function" / "isLocalAssetSrc is not a function". GREEN: after implementing exports  | checks: npm run lint:strict: exit 0, no warnings; npx tsc --noEmit: exit 0; npx vitest run: 49 files passed, 680 tests passed; npx react-doctor@latest --verbose: score 87; no diagnostics reference StoredImage.tsx or imageL | verifier pass, tier medium | deploy: No config or schema changes. Local raster assets such as /libro-reclamaciones-indecopi.png and the /images fallbacks now use Vercel Image Optimization, which uses a small amount of quota. Pending manual check: in dev, confirm the footer badge loads from /_next/image?url=%2Flibro-reclamaciones-indeco

### T18: Remove /login and /buscar from the sitemap, noindex login, admin and query-bearing /buscar, and use real lastModified dates

**Observations:**
- GEN:seo:/login is listed in the sitemap while robots.txt disallows it, and it inherits index,follow plus the homepage canonical and title
- GEN:seo:Sitemap lastModified is the request time for static and category entries, and the internal search page is listed
- GEN:seo:Sitemap lastModified ... internal search page is listed (recommendation: 'optionally noindex /buscar when ?q is present')

**Approach:** sitemap.ts:25-42 lists /buscar and /login, and :10 uses `now` for static and category entries. robots.ts:14 disallows /login. The login page is 'use client' with no metadata, so it inherits the root canonical '/' with index:true. (1) New pure src/lib/sitemapEntries.ts buildSitemapEntries(siteUrl, categories, products). It omits /buscar and /login. Each category's lastModified is the newest updatedAt among its products (getSitemapProducts() carries categorySlug and updatedAt), / and /catalogo use the global newest, and /libro-de-reclamaciones omits lastModified. sitemap.ts calls the helper. (2) New src/app/(auth)/layout.tsx exports metadata { title: 'Acceso', robots: { index: false, follow: false }, alternates: { canonical: null } } and renders children. (3) src/app/(admin)/layout.tsx exports the same robots metadata. (4) robots.ts drops '/login' from disallow so Google can see the noindex; /admin/ and /api/ stay disallowed. (5) /buscar generateMetadata returns robots { index: false, follow: true } when q is non-empty; bare /buscar stays indexable with canonical /buscar. (6) tests/phase1-verify.spec.ts asserts that the sitemap body does not match /login< or /buscar<, and that /login and /buscar?q=rosas have a meta robots noindex. These assertions are not run.

**Files:** `src/app/sitemap.ts`, `src/lib/sitemapEntries.ts`, `src/lib/sitemapEntries.test.ts`, `src/app/robots.ts`, `src/app/(auth)/layout.tsx`, `src/app/(admin)/layout.tsx`, `src/app/(public)/buscar/page.tsx`, `tests/phase1-verify.spec.ts`

**New files allowed in:** `src/app/(auth)`, `src/lib`

**Test plan:** RED/GREEN with vitest. Write sitemapEntries.test.ts first (RED: the helper does not exist and today's code uses `now`): no /login or /buscar URL appears, a category's lastModified equals its newest product's updatedAt, and /libro-de-reclamaciones has no lastModified. The e2e assertions are compiled with npx playwright test --list only.

**Acceptance:**
- The sitemap has no /login or /buscar entry
- /login and /admin pages emit robots noindex,nofollow, and /login has no canonical
- /buscar?q=... emits noindex,follow; bare /buscar does not
- robots.txt no longer disallows /login
- Category lastModified values come from product updatedAt

**Checks:** `npm run lint:strict`, `npx tsc --noEmit`, `npx vitest run`, `npx playwright test --list`

**Risk:** Low. Removing /login from the robots.txt disallow list is deliberate, so crawlers can see its noindex.

**Commit:** `fix(seo): clean the sitemap and noindex auth, admin and search`

**Evidence:** RED: I wrote src/lib/sitemapEntries.test.ts first. Running `npx vitest run src/lib/sitemapEntries.test.ts` failed with "Failed to resolve import ./sitemapEntries" (Test Files 1 failed, no tests ran) because the helper did not exist yet. GREEN: I added src/lib/sitemapEntries.ts and the same command p | checks: npm run lint:strict: exit 0, no warnings; npx tsc --noEmit: exit 0, no errors; npx vitest run: Test Files 50 passed (50), Tests 688 passed (688); npx playwright test: Total: 100 tests in 16 files, exit 0; the new and renamed T1; npx react-doctor@latest --verbose: Score 87, the same as the baseline (87) measured with my tra | verifier pass, tier medium | deploy: No schema or console prerequisites. After deployment robots.txt no longer contains 'Disallow: /login', so Googlebot can crawl /login and read its noindex. /admin/ and /api/ are still disallowed. If Search Console flagged /login as 'Indexed, though blocked by robots.txt', it should clear once Google 

### T19: Normalize the CMS website value to a single https origin and stop caching default settings on errors

**Observations:**
- GEN:seo:All canonical, sitemap, robots and JSON-LD URLs come from one CMS field with no normalization
- SEC-H:[h12-wildcard] getCachedSiteSettings caches defaultSiteSettings() for 300s on any repository error

**Approach:** siteSettings.ts:21-28 isHttpUrl accepts http with any path or trailing slash, and actions/siteSettings.ts:134 stores the value as entered. The value feeds metadataBase, the sitemap, robots and JSON-LD. getSiteSettings.ts:60-72 catches every error inside unstable_cache and stores the defaults for 300 s. (1) New src/lib/siteOrigin.ts normalizeSiteOrigin(value): new URL(value.trim()), force the protocol to https, and return url.origin (lowercase host, no path, no trailing slash), or null when unparseable. (2) siteSettingsSchema.website: refine that normalizeSiteOrigin is not null, then transform to its result. (3) getSiteSettings fromRow: website = normalizeSiteOrigin(row.website) ?? defaults.website, which protects rows already stored. (4) The cached function rethrows repository errors, so unstable_cache does not persist them. The exported getSiteSettings catches the error, logs it with console.error and returns defaultSiteSettings() uncached. A null row still returns the defaults, which is a legitimate empty state.

**Files:** `src/lib/siteOrigin.ts`, `src/lib/siteOrigin.test.ts`, `src/features/admin/schemas/siteSettings.ts`, `src/features/admin/schemas/siteSettings.test.ts`, `src/features/settings/queries/getSiteSettings.ts`, `src/features/settings/queries/getSiteSettings.test.ts`

**New files allowed in:** `src/lib`, `src/features/settings/queries`

**Test plan:** RED/GREEN with vitest. siteOrigin.test.ts: 'https://www.kataleyaflowers.com/' becomes 'https://www.kataleyaflowers.com'; http becomes https; a path or query is stripped; garbage gives null. Extend siteSettings.test.ts (from T08): the schema output's website is normalized (RED today: kept verbatim). getSiteSettings.test.ts, with next/cache mocked as a passthrough and the repository throwing: the function returns the defaults, and the next call hits the repository again.

**Acceptance:**
- Stored and read website values are always a bare https origin
- A repository error is never cached; defaults are served uncached and logged

**Checks:** `npm run lint:strict`, `npx tsc --noEmit`, `npx vitest run`

**Risk:** Low. During an Appwrite outage, each request retries Appwrite instead of serving cached defaults, which costs slightly more under failure.

**Commit:** `fix(seo): normalize the site origin and stop caching error defaults`

**Evidence:** RED (observed before implementation, `npx vitest run` on the 3 target test files): Test Files 3 failed, Tests 8 failed | 21 passed. siteOrigin.test.ts failed with "Cannot find module './siteOrigin'". In siteSettings.test.ts the website normalization cases failed, for example "expected 'https://www.k | checks: npm run lint:strict: exit 0, eslint --max-warnings 0 clean; npx tsc --noEmit: exit 0, no errors; npx vitest run: exit 0, Test Files 52 passed (52), Tests 716 passed (716) | verifier pass, tier medium | deploy: No schema or console change needed. Rows already stored with a trailing slash, http or a path are normalized when read, and unparseable values fall back to BUSINESS.website. The next admin save also writes the normalized origin. Expected cost: during an Appwrite outage each request calls the reposit

### T20: Enrich Florist and Product JSON-LD (id, image, geo, hasMap, areaServed, sku, seller) from business constants, and drop empty images

**Observations:**
- GEN:seo:Florist LocalBusiness schema lacks geo, image, hasMap, areaServed and @id, and the address fields are malformed (still open from QA/audit/01-landing.md:43)
- GEN:seo:Product JSON-LD is thin for merchant listings: availability is always InStock, there is no sku, @id, seller, shipping or return policy, and the image array can be empty
- GEN:seo:Florist LocalBusiness schema ... address fields malformed (recommendation: addressLocality = district, postalCode, Business Profile in sameAs)

**Approach:** Today src/app/layout.tsx:86-88 sets streetAddress to settings.address ('Teodosio Parreño 115 (ex cortijo), Lima, Perú') and addressLocality to settings.location ('Lima, Perú'). Under AGENTS.md, business data lives in src/lib/constants.ts, so no locality strings are hardcoded in builders. (1) Add BUSINESS.postalAddress to src/lib/constants.ts: { locality: 'Lima', region: 'Lima', country: 'PE', areaServed: 'Lima', district: null, postalCode: null, googleBusinessProfileUrl: null }. The null fields stay null until the owner confirms them (see console checklist and not_fixing). (2) New src/lib/structuredData.ts with pure builders. buildFloristJsonLd(settings, postalAddress) emits @id `${website}/#florist`, image `${website}/opengraph-image`, and geo GeoCoordinates parsed from settings.mapsEmbedUrl (the !3d<lat>!2d<lng> pattern, or q=lat,lng), omitted when absent. hasMap is a Google Maps URL for those coordinates, and areaServed is a City named postalAddress.areaServed. The address has streetAddress = settings.address with a trailing `, ${settings.location}` removed, addressLocality = postalAddress.district ?? postalAddress.locality, and addressRegion and addressCountry from the constants. postalCode is emitted only when set. sameAs is Instagram plus googleBusinessProfileUrl when set. buildProductJsonLd emits @id `${productUrl}#product`, sku = product.id, offers.seller { '@id': florist id } and a brand that references the florist. It filters out empty image strings and omits image when none remain. Availability stays InStock, because only active products render. shippingDetails and hasMerchantReturnPolicy need business data and stay out until the owner supplies it. (3) src/app/layout.tsx and [slug]/page.tsx call the builders and render through the T08 JsonLd. (4) tests/phase1-verify.spec.ts asserts that the home JSON-LD has a Florist with geo and @id. Compile only; do not run it.

**Files:** `src/lib/structuredData.ts`, `src/lib/structuredData.test.ts`, `src/lib/constants.ts`, `src/app/layout.tsx`, `src/app/(public)/catalogo/[categoria]/[slug]/page.tsx`, `tests/phase1-verify.spec.ts`

**New files allowed in:** `src/lib`

**Test plan:** RED/GREEN with vitest. Write structuredData.test.ts first (the builders do not exist yet). The Florist has @id, hasMap, and geo with lat -12.13 and lng -77.02 from the current BUSINESS.mapsEmbedUrl. streetAddress does not end with 'Lima, Perú'. addressLocality comes from the constants. postalCode is absent while null and present when set. A Product with imageUrl '' has no image key and has sku and offers.seller.

**Acceptance:**
- The Florist JSON-LD has @id, image, geo (when parseable), hasMap, areaServed and a non-duplicated streetAddress
- Locality, region, country and the optional district, postalCode and GBP URL come from src/lib/constants.ts
- The Product JSON-LD has @id, sku and seller, and never an empty image
- npx playwright test --list compiles the new assertion

**Checks:** `npm run lint:strict`, `npx tsc --noEmit`, `npx vitest run`, `npx playwright test --list`

**Risk:** Low. Coordinates parsed from the embed URL depend on the owner's maps paste. The owner validates the result with Google's Rich Results Test after deploy.

**Commit:** `feat(seo): enrich Florist and Product structured data`

**Evidence:** RED: I wrote src/lib/structuredData.test.ts before the module existed. `npx vitest run src/lib/structuredData.test.ts` reported "Test Files 1 failed (1), Tests no tests" because the import of './structuredData' could not be resolved. GREEN: after I added BUSINESS.postalAddress and src/lib/structured | checks: npm run lint:strict: exit 0, no warnings; npx tsc --noEmit: exit 0; npx vitest run: 53 files / 728 tests passed, exit 0; npx playwright test: Total: 101 tests in 16 files, exit 0; it lists the new 'JSON; npx react-doctor@latest --verbose: score 87; 7 warnings, all in files outside this task (script | verifier pass, tier medium | deploy: No schema or console change is needed. The owner should confirm BUSINESS.postalAddress.district, postalCode and googleBusinessProfileUrl in src/lib/constants.ts; they stay null and are left out until then. geo and hasMap come from the site settings mapsEmbedUrl: if the owner pastes a map URL with no

### T21: Add local intent to titles and H1s, trim descriptions on word boundaries, size product OG images, redirect recategorized products, and add a fallback home H1

**Observations:**
- GEN:seo:Category and product titles, H1s and descriptions leave out local intent ('Lima', 'a domicilio'), and descriptions are cut mid-word
- GEN:seo:Product og:image is the raw full-size Appwrite original with no dimensions or alt (still open from QA/audit/04-producto-detalle.md:44)
- GEN:seo:The homepage H1 depends entirely on a CMS hero slide; with no published slide there is no H1
- GEN:seo:Moving a product to another category, or changing its slug, breaks the old URL with a 404 and no redirect

**Approach:** (1) New src/lib/seoText.ts truncateOnWord(text, 160) cuts at the last space and appends an ellipsis; it replaces .slice(0,160) in [slug]/page.tsx and [categoria]/page.tsx. (2) Titles: the category title is `${category.name} a domicilio en ${city}` and the product title is `${product.name} | Flores en ${city}`, where city is BUSINESS.postalAddress.locality from T20. The root template still appends the brand, so the AGENTS.md no-brand-in-child-title rule holds. The /catalogo H1 becomes `Catálogo de flores y arreglos en ${city}`. (3) Add ogImageUrl(src, 1200, 630) to src/lib/imageLoader.ts. It uses the config-free parseStorageViewPath and builds an Appwrite /preview URL with width, height, output jpg and gravity center. Product openGraph.images becomes up to 3 entries { url, width:1200, height:630, alt: product.name }, and twitter uses the first. (4) In [slug]/page.tsx, when a slug resolves to an active product whose actual category is a different active category, call permanentRedirect(`/catalogo/${actual.slug}/${product.slug}`) instead of notFound(). Old-slug redirects would need a previous_slugs attribute (a schema change) and stay out of scope. (5) In HeroSection/index.tsx, when getPublishedHeroSlide() returns null, render <h1 className='sr-only'> with `${settings.name} — Floristería en ${settings.location}`.

**Files:** `src/lib/seoText.ts`, `src/lib/seoText.test.ts`, `src/lib/imageLoader.ts`, `src/lib/imageLoader.test.ts`, `src/app/(public)/catalogo/[categoria]/[slug]/page.tsx`, `src/app/(public)/catalogo/[categoria]/page.tsx`, `src/app/(public)/catalogo/page.tsx`, `src/features/landing/components/HeroSection/index.tsx`

**New files allowed in:** `src/lib`

**Test plan:** RED/GREEN with vitest. Write both test files first. seoText.test.ts covers the word-boundary cut, no change under the limit, and the ellipsis. imageLoader.test.ts checks that ogImageUrl produces /preview with width=1200, height=630 and output=jpg for a canonical view URL, and passes local paths through. Check the redirect and the H1 manually in npm run dev, simulating a recategorization by requesting /catalogo/<other-active-category>/<slug>.

**Acceptance:**
- Category and product titles carry local intent without the brand
- No description is cut mid-word
- The product og:image has width, height and alt
- A wrong-category URL for an active product redirects with 308 to the canonical path
- The home page always has exactly one H1

**Checks:** `npm run lint:strict`, `npx tsc --noEmit`, `npx vitest run`

**Risk:** Low-medium. Title changes reset some search-result snippets. Browsers cache a permanent redirect, so it must fire only for an existing active product.

**Commit:** `feat(seo): add local intent, sized OG images and category redirects`

**Evidence:** RED: I wrote both test files first and ran `npx vitest run src/lib/seoText.test.ts src/lib/imageLoader.test.ts`. Result: 2 failed files, 3 failed tests, 18 passed. seoText.test.ts failed with "Error: Cannot find module './seoText'". The 3 ogImageUrl tests failed with "TypeError: ogImageUrl is not a  | checks: npm run lint:strict: exit 0, no warnings or errors; npx tsc --noEmit: exit 0, no errors; npx vitest run: 54 files passed, 738 tests passed, exit 0; npx react-doctor@latest --verbose: score 87; 7 warnings, all in files outside this change (scri | verifier pass, tier medium | deploy: No schema or console changes. Product and category titles change, which resets some search-result snippets. A 308 is cached by browsers, but it fires only for an existing active product in an active category. Redirects from an old product slug are still out of scope; they would need a previous_slugs

### T22: Carry admin-written image alt text through to the product gallery and lightbox

**Observations:**
- GEN:seo:Alt text the admin writes for product images is saved but never shown; the public site uses generic or empty alts

**Approach:** products/mappers.ts:32-38 deriveProductImages drops altText, although fetchRelated already loads it. Return { imageUrl, imageAlt, gallery, galleryAlts }, and add imageAlt?: string and imageAlts?: string[] (aligned with images) to the repository Product and to the catalog Product, through mapProductRow. ProductGallery.tsx uses the stored alt, falls back to `${name} - foto ${i + 1}` or the name, and passes it to LightboxDialog. Listing cards keep alt='' because their text already names the product, and CatalogCardProduct is unchanged. Surface extended under the user standing authorization: src/app/(public)/catalogo/[categoria]/[slug]/page.tsx.

**Files:** `src/lib/database/repositories/products/mappers.ts`, `src/lib/database/repositories/products/mappers.test.ts`, `src/lib/database/repositories/products/types.ts`, `src/features/catalog/types/index.ts`, `src/features/catalog/queries/mappers.ts`, `src/features/catalog/components/ProductGallery.tsx`, `src/components/ui/LightboxDialog.tsx`, `src/app/(public)/catalogo/[categoria]/[slug]/page.tsx`

**Test plan:** RED/GREEN with vitest. Extend mappers.test.ts so deriveProductImages returns the primary image's altText as imageAlt and the gallery alts in display order. RED today, because alt text is not returned.

**Acceptance:**
- Admin-entered alt text appears on the gallery and lightbox images
- Missing alts fall back to descriptive text, never an empty string, on the detail page

**Checks:** `npm run lint:strict`, `npx tsc --noEmit`, `npx vitest run`

**Risk:** Low.

**Commit:** `fix(catalog): render admin-written alt text in the product gallery`

**Evidence:** RED: I extended mappers.test.ts so deriveProductImages must return imageAlt and galleryAlts, and toProduct must expose imageAlt and imageAlts. Running `npx vitest run src/lib/database/repositories/products/mappers.test.ts` gave "Tests 8 failed | 6 passed (14)", for example "expected undefined to be  | checks: npm run lint:strict: exit 0, no warnings (eslint . --max-warnings 0); npx tsc --noEmit: exit 0; npx vitest run: 54 files passed, 740 tests passed, exit 0; npx react-doctor@latest --score: 67 before and 67 after: no regression; npx react-doctor@latest --verbose: 7 warnings, all in files this task did not touch (the Catalo | verifier pass, tier medium | surface extended: 1) I also edited src/app/(public)/catalogo/[categoria]/[slug]/page.tsx, a surface extension authorized by the parent, so | deploy: No schema or console changes. Alt text is already stored in product images and loaded by fetchRelated.

### T23: Keep complaint form values on failed submit, focus the first invalid field, and print the consumer copy from a sandboxed iframe

**Observations:**
- GEN:a11y-ux:The Libro de Reclamaciones form wipes everything the customer typed when validation fails
- GEN:a11y-ux:Errors in the complaints form are not brought to the user: no focus on the first invalid field, and many alerts fire at once
- GEN:a11y-ux:Complaint success flow: no focus move to the confirmation, and a blocked print popup fails silently
- SEC-H:[h07-rendering] the complaint print view writes consumerCopyEmail HTML into a same-origin about:blank popup with document.write

**Approach:** ComplaintForm/index.tsx:48-90 returns { error, fieldErrors } from a useActionState action, and React then resets the uncontrolled fields. (1) Extract a pure formDataToComplaint(formData, extras) into ComplaintForm/formData.ts, and include values: ComplaintFormData in the error state. ConsumerFields, ItemFields and DetailFields take a values prop and set defaultValue and defaultChecked from it, with each field keyed to the submission count so new defaults apply. (2) After a failed submit, a useEffect on state focuses the first [aria-invalid='true'] element in DOM order, as SiteSettingsForm/index.tsx:63 does, and scrolls it into view. Remove role='alert' from FieldError.tsx:13; aria-describedby already links each message. The top FormError becomes one summary such as 'Revisa 3 campos marcados'. (3) In SubmitState, the confirmation h2 gets tabIndex={-1} and receives focus on mount. handlePrint no longer uses window.open or document.write, and does not inject the email HTML into the page: consumerCopyEmail is a full HTML document with its own <style>, which would leak into the page. Instead it mounts a visually hidden <iframe sandbox='allow-modals allow-same-origin' srcDoc={consumerCopyHtml}> with no allow-scripts, so markup that escapes escapeHtml still cannot execute. On load it calls iframeRef.current.contentWindow.print(), and if printing throws it shows an inline message. The iframe is removed after the afterprint event. (4) Apply the same value retention to CategoryForm.tsx and ComplaintStatusForm.tsx, which use the same action-reset pattern. (5) Update AGENTS.md:184, which prescribes <FieldError role="alert">, to the new pattern: aria-describedby, one summary alert, and focus on the first invalid field.

**Files:** `src/features/complaints/components/ComplaintForm/index.tsx`, `src/features/complaints/components/ComplaintForm/formData.ts`, `src/features/complaints/components/ComplaintForm/formData.test.ts`, `src/features/complaints/components/ComplaintForm/ConsumerFields.tsx`, `src/features/complaints/components/ComplaintForm/ItemFields.tsx`, `src/features/complaints/components/ComplaintForm/DetailFields.tsx`, `src/features/complaints/components/ComplaintForm/SubmitState.tsx`, `src/features/admin/components/ProductForm/FieldError.tsx`, `src/components/ui/FormField.tsx`, `src/features/admin/components/CategoryForm.tsx`, `src/features/complaints/components/admin/ComplaintStatusForm.tsx`, `AGENTS.md`

**New files allowed in:** `src/features/complaints/components/ComplaintForm`

**Test plan:** RED/GREEN with vitest only for the extracted pure code. Write formData.test.ts first: formDataToComplaint maps every field, an empty amount, and the default docType. Component behavior (value retention, focus, print) has no DOM runner, and jsdom would be a new dependency, so verify it manually in npm run dev with an invalid submission: a single bad field keeps every other value, and focus moves to that field. Since T04, invalid submissions are rejected before any Appwrite write. Never submit a valid complaint locally against production; check the print iframe with a mocked state or on a preview.

**Acceptance:**
- A failed submit keeps every entered value in the complaint, category and complaint-status forms
- Focus moves to the first invalid field, and only one summary alert is announced
- The success heading receives focus
- Printing uses a sandboxed srcdoc iframe without allow-scripts; no window.open or document.write remains
- AGENTS.md:184 describes the new error pattern

**Checks:** `npm run lint:strict`, `npx tsc --noEmit`, `npx vitest run`, `rg -n "document.write|window.open" src/features/complaints (expect no match)`

**Risk:** Medium. FieldError is shared by every admin form, so dropping role=alert changes how they announce errors. Some browsers block print() from hidden iframes, so the iframe stays in the layout (off-screen, not display:none). The legally required channel is touched, so the security review applies per AGENTS.md.

**Commit:** `fix(complaints): retain form values, focus errors and sandbox print`

**Evidence:** RED: I wrote formData.test.ts and printDocument.test.ts first. `npx vitest run src/features/complaints/components/ComplaintForm` then failed with 2 failed files and no tests run: "Error: Cannot find module './printDocument' imported from .../printDocument.test.ts", and the same error for './formData | checks: npm run lint:strict: exit 0, no warnings; npx tsc --noEmit: exit 0; npx vitest run: 56 files passed, 751 tests passed; rg -n "document.write|window.open": no match (exit 1); npx react-doctor@latest --verbose: score 87/100, 7 warnings, all in files this task did not tou | verifier pass, tier medium | deploy: No schema, console or environment changes. Printing depends on browser support for print() from a sandboxed srcdoc iframe (sandbox='allow-modals allow-same-origin', no allow-scripts). Check it on a preview in Chrome, Safari and Firefox before production. Removing role=alert from FieldError changes h

### T24: Make complaint form widgets accessible and give each field an actionable error message

**Observations:**
- GEN:a11y-ux:Complaint form widgets: the radio group has no arrow keys, and the minor toggle's name doesn't match its visible text
- GEN:a11y-ux:Complaint and generic validation messages don't say how to fix, and one message names the wrong field

**Approach:** DetailFields.tsx:37-61 uses <button role='radio'> with no arrow keys. (1) Replace it with native <input type='radio' name='complaintType'> elements inside <label> cards, keeping the current look with peer and has-[:checked] classes and 44px targets. (2) In ConsumerFields.tsx:96-103, wrap the Switch and its visible text in one <label> (or add aria-labelledby on the visible span) with the single wording 'Represento a un menor de edad'. Add autoComplete name, street-address, tel and email to the consumer fields. (3) In common.ts, turn longText into longTextField(requiredMessage), with the existing message as the default for admin callers. (4) complaint.ts passes per-field messages: itemDescription 'Describe el producto o servicio', detail 'Describe lo ocurrido', consumerRequest 'Indica qué solicitas (cambio, devolución, etc.)'. It overrides the email, docNumber and peruPhone messages with fix-it copy ('Ingresa un correo como nombre@ejemplo.com', 'El documento debe tener entre 6 y 15 letras o números', 'Ingresa un teléfono de 9 dígitos'), and replaces 'Monto fuera de rango' with 'El monto debe ser menor a S/ 1 000 000'. Use tú, never voseo.

**Files:** `src/features/complaints/components/ComplaintForm/DetailFields.tsx`, `src/features/complaints/components/ComplaintForm/ConsumerFields.tsx`, `src/features/admin/schemas/common.ts`, `src/features/complaints/schemas/complaint.ts`, `src/features/complaints/schemas/complaint.test.ts`

**New files allowed in:** `src/features/complaints/schemas`

**Test plan:** RED/GREEN with vitest. In complaint.test.ts: an empty consumerRequest yields its field-specific message (RED today: 'La descripción es obligatoria'); a bad email gives the example message; valid data passes. Check the widgets with the keyboard in npm run dev: arrow keys move between the radios, and clicking the label text toggles the switch.

**Acceptance:**
- complaintType uses native radio inputs that respond to the arrow keys
- The minor toggle's accessible name matches its visible text
- Each complaint field has its own actionable error message
- The admin longText default message is unchanged

**Checks:** `npm run lint:strict`, `npx tsc --noEmit`, `npx vitest run`

**Risk:** Low-medium. The restyled radios must keep the 44px targets and the current look.

**Commit:** `fix(complaints): make form widgets accessible with actionable errors`

**Evidence:** RED: I wrote src/features/complaints/schemas/complaint.test.ts first. Running `npx vitest run src/features/complaints/schemas/complaint.test.ts` gave "Tests 10 failed | 2 passed (12)". Observed failures: consumerRequest Expected "Indica qué solicitas (cambio, devolución, etc.)" Received "La descripc | checks: npm run lint:strict: exit 0, no warnings; npx tsc --noEmit: exit 0, no errors; npx vitest run: 57 files passed, 763 tests passed; npx react-doctor@latest --verbose: score 87; 7 warnings, all in files this task did not touch ( | verifier pass, tier medium | deploy: None. Client and schema changes only. No Appwrite, env or console changes.

### T25: Complete the navbar search combobox pattern with keyboard support, add mega-menu keyboard access, and stop iOS zoom in the mobile search

**Observations:**
- GEN:a11y-ux:Desktop search overlay: no Escape to close, and closing drops keyboard focus to <body>
- GEN:a11y-ux:Catalog mega-menu can't be reached by keyboard and doesn't close on Escape
- GEN:a11y-ux:Mobile drawer search input is 14px, so iOS zooms the page when it auto-focuses

**Approach:** AGENTS.md:185 prescribes the combobox pattern (role="combobox" + aria-autocomplete="list" + role="option"), so the roles stay and the missing keyboard support is added. Today SearchBar.tsx:49 is a combobox whose controlled panel (SearchOverlay/index.tsx:62) has no listbox or option roles, and MobileDrawer.tsx:89,109-117 has options with no active-descendant handling. (1) New pure src/components/shared/Navbar/comboboxNavigation.ts nextActiveIndex(current, key, count), which handles ArrowDown, ArrowUp, Home and End with wrap and returns -1 for none. A new useComboboxNavigation(count, onSelect) hook in the same folder returns activeIndex, onKeyDown and getOptionProps(i). The input gets aria-activedescendant, Enter follows the active option, and Escape closes. (2) Desktop: SearchResultsPanel renders role='listbox' with id='search-listbox' and the combobox's aria-controls points to it; SearchResultCard items get role='option', an id and aria-selected. SearchBar and MobileDrawer use the hook. (3) useDesktopSearch.ts closeSearch restores focus to the 'Buscar' trigger through a ref passed in by DesktopActions. Escape inside SearchBar closes the overlay. (4) Catalog menu: DesktopNav renders a disclosure <button aria-expanded aria-controls> next to the 'Catálogo' link that toggles the panel on click or Enter. The CatalogMenu panel follows the trigger in DOM order, or focus moves into it on open. Escape closes it and returns focus to the button. useCatalogMenu does not close on blur while focus stays inside the panel, and hover-open keeps working for mouse users. (5) The MobileDrawer.tsx:87 input uses text-base md:text-sm. (6) T16 mounts the overlays lazily, so every focus call runs after the dynamic component has mounted, in an effect keyed on open.

**Files:** `src/components/shared/Navbar/comboboxNavigation.ts`, `src/components/shared/Navbar/comboboxNavigation.test.ts`, `src/components/shared/Navbar/useComboboxNavigation.ts`, `src/components/shared/Navbar/useDesktopSearch.ts`, `src/components/shared/Navbar/SearchOverlay/SearchBar.tsx`, `src/components/shared/Navbar/SearchOverlay/SearchResultsPanel.tsx`, `src/components/shared/Navbar/SearchOverlay/SearchResultCard.tsx`, `src/components/shared/Navbar/SearchOverlay/index.tsx`, `src/components/shared/Navbar/DesktopActions.tsx`, `src/components/shared/Navbar/DesktopNav.tsx`, `src/components/shared/Navbar/useCatalogMenu.ts`, `src/components/shared/Navbar/CatalogMenu/index.tsx`, `src/components/shared/Navbar/MobileDrawer.tsx`, `src/components/shared/Navbar/index.tsx`

**New files allowed in:** `src/components/shared/Navbar`

**Test plan:** RED/GREEN with vitest for the pure index math. Write comboboxNavigation.test.ts first: ArrowDown from -1 goes to 0, it wraps at both ends, Home and End work, and count 0 always gives -1. The keyboard and focus wiring has no DOM runner, so check it manually in npm run dev. Tab to Buscar, press Enter, type, use ArrowDown and Enter (the result opens), then Escape (focus returns to Buscar). Tab to the Catálogo disclosure, press Enter, Tab into the category links, then Escape (focus returns). On mobile, arrow through the results. Check iOS zoom on the owner's iPhone or in Safari responsive mode.

**Acceptance:**
- Both search inputs keep role=combobox and aria-autocomplete=list; their results expose role=listbox and role=option with aria-activedescendant
- Arrow keys, Home, End, Enter and Escape work in both searches
- Closing the desktop search returns focus to the trigger
- The mega-menu opens from the keyboard and closes on Escape, returning focus; mouse hover still opens it
- The mobile search input is at least 16px on small screens

**Checks:** `npm run lint:strict`, `npx tsc --noEmit`, `npx vitest run`

**Risk:** Medium. Navbar interaction changes affect every public page. The hover-open behavior of the mega-menu must keep working for mouse users.

**Commit:** `fix(navbar): complete search combobox and mega-menu keyboard support`

**Evidence:** I wrote src/components/shared/Navbar/comboboxNavigation.test.ts first, with 8 cases: ArrowDown from -1 goes to 0, ArrowUp from -1 goes to the last option, it steps through options, it wraps at both ends, Home and End work, count 0 always gives -1, unhandled keys keep the index, and a stale index is  | checks: npm run lint:strict: pass (eslint . --max-warnings 0, no output); npx tsc --noEmit: pass (no errors); npx vitest run: pass: 58 test files, 771 tests passed; npx react-doctor@latest --verbose: no regression: score 87/100 with the same 7 warnings before  | verifier pass, tier medium | deploy: No deploy steps or schema changes. Still to do by hand (no DOM runner in this repo): in npm run dev, Tab to Buscar, press Enter, type, use ArrowDown and Enter, then Escape (focus should return to Buscar). Tab to the 'Ver categorías' chevron, press Enter, Tab through the category links, then Escape (

### T26: Announce login errors, dedupe skip links, add keyboard crop panning, and fix copy leftovers

**Observations:**
- GEN:a11y-ux:Admin login error is still not announced or tied to the fields (open since QA/audit/07)
- GEN:a11y-ux:The admin shows two identical skip links, and some public routes have no skip target
- GEN:a11y-ux:Cover crop panning only works by dragging; there is no keyboard alternative
- GEN:a11y-ux:Copy leftovers: one voseo, a missing accent in an aria-label, English admin jargon, and a usted placeholder

**Approach:** (1) In login/page.tsx, the error <p> gets id='login-error' and role='alert', and while an error shows, both inputs get aria-invalid and aria-describedby='login-error'. (2) Remove the duplicate skip link from src/app/(admin)/layout.tsx; the root link already covers it. Add id='main-content' and tabIndex={-1} to the <main> in login/page.tsx, catalogo/error.tsx and catalogo/loading.tsx. (3) In CropStage.tsx:112-125, the stage gets tabIndex={0}, role='application' and the aria-label 'Encuadre: usa las flechas para mover la imagen'. Arrow keys pan by 1% (10% with Shift) through a new pure nudgeOffset(offset, key, shift, bounds) in CoverEditor/nudgeOffset.ts, feeding the same setter the pointer handlers use. (4) Copy: CategoryForm.tsx:136 'Mencioná' becomes 'Menciona'; Navbar/index.tsx:85 'menu' becomes 'menú'; inicio/page.tsx:62,68 'Hero' becomes 'Portada'; :69 'Agregar slide' becomes 'Agregar imagen de portada'; hero/[id]/page.tsx:15,36 'Editar slide' becomes 'Editar imagen de portada'; CategoryForm.tsx:97 'Slug' becomes 'Dirección web'; the ComplaintStatusForm.tsx:76 placeholder becomes 'Escribe la respuesta enviada al consumidor.'. Check rg for other visible 'slide' strings in hero/nuevo.

**Files:** `src/app/(auth)/login/page.tsx`, `src/app/(admin)/layout.tsx`, `src/app/(public)/catalogo/error.tsx`, `src/app/(public)/catalogo/loading.tsx`, `src/features/admin/components/CoverEditor/CropStage.tsx`, `src/features/admin/components/CoverEditor/nudgeOffset.ts`, `src/features/admin/components/CoverEditor/nudgeOffset.test.ts`, `src/features/admin/components/CategoryForm.tsx`, `src/components/shared/Navbar/index.tsx`, `src/app/(admin)/admin/inicio/page.tsx`, `src/app/(admin)/admin/inicio/hero/[id]/page.tsx`, `src/app/(admin)/admin/inicio/hero/nuevo/page.tsx`, `src/features/complaints/components/admin/ComplaintStatusForm.tsx`

**New files allowed in:** `src/features/admin/components/CoverEditor`

**Test plan:** RED/GREEN with vitest for nudgeOffset.test.ts, written first: each arrow moves the offset by 1, Shift moves it by 10, and the result clamps at the bounds. Structural rg checks: the copy rg returns nothing, and exactly one 'Saltar al contenido' renders per admin page. Do a manual keyboard pass in dev.

**Acceptance:**
- The login error is announced and linked to both inputs
- Admin pages render exactly one skip link; login and the catalog error and loading states have a main-content target
- The crop stage pans with the arrow keys
- None of the listed leftover strings remains

**Checks:** `npm run lint:strict`, `npx tsc --noEmit`, `npx vitest run`, `rg -n "Mencioná|Cerrar menu|Abrir menu|Detalle la respuesta|Agregar slide|Editar slide" src (expect no match)`

**Risk:** Low. The renamed admin terms change what the owner is used to, so she should be told.

**Commit:** `fix(a11y): announce login errors, dedupe skip links and fix copy`

**Evidence:** RED: I wrote src/features/admin/components/CoverEditor/nudgeOffset.test.ts first. `npx vitest run .../nudgeOffset.test.ts` failed because the module could not be resolved: "import { nudgeOffset } from './nudgeOffset'", 1 failed file, no tests. GREEN: after I added nudgeOffset.ts, 12 of 12 passed. I  | checks: npm run lint:strict: exit 0, no problems. The first run failed on role=applicatio; npx tsc --noEmit: exit 0, no errors; npx vitest run: 59 test files passed, 786 of 786 tests passed; rg -n "Mencioná|Cerrar: no match (exit 1); rg -c "Saltar: only src/app/layout.tsx:1, so admin pages render one skip li; npx react-doctor@latest --verbose: Score 87/100. 7 warnings, all in files this task did not tou | verifier pass, tier medium | surface extended: 1) Crop stage role: the plan said role='application', but lint:strict fails on it because jsx-a11y treats application as | deploy: There is no schema, console or env change. The owner should be told about the renamed admin terms: Hero is now 'Portada', slide is now 'imagen de portada', and Slug is now 'Dirección web'. A manual keyboard pass in dev is still pending: Tab to the crop stage, then try the arrows and Shift+arrows. Al

### T27: Replace gold text and focus rings on light backgrounds with contrast tokens, enforce it in ESLint, and show the exact price after a size is chosen

**Observations:**
- GEN:a11y-ux:Gold #e8b84b is still used for text and focus rings on cream/white (1.8:1), breaking the 'gold is not text' rule in docs/design.md
- GEN:a11y-ux:Product price reads 'Desde S/ X' even after the customer picks a specific size

**Approach:** Per docs/design.md:94, gold on cream is about 1.8:1. Token values stay unchanged. (1) The ProductPurchasePanel.tsx:129 note text uses var(--color-gold-text). (2) Focus outlines on cream move to --color-primary, matching the rest of the site: BestSellersTabs.tsx:74,84,97, ValuePropCard.tsx:7, EditorialTile.tsx:53 and CategoryTile.tsx:18. Check the background behind OtherContactMethods.tsx:64 and switch it if it sits on cream. Footer outlines on green stay as they are (4.37:1). (3) ProductPurchasePanel.tsx:76-81 shows 'Desde' only while no variant is selected, and then the exact selected price. The helper text at :151 goes from text-dark/50 to text-(--color-muted). (4) In eslint.config.mjs, flat config replaces a rule's options rather than merging them, and the existing single 'no-restricted-syntax' block (around line 139) already carries the hex, business-data and z-index selectors. Hoist those selector objects into one top-level const array, restrictedSyntaxSelectors, and append the gold selector (a JSX className Literal matching (text|outline)-\(--color-secondary\)). The main block uses ['error', ...restrictedSyntaxSelectors]. A new src/components/shared/Footer.tsx override uses ['error', ...restrictedSyntaxSelectors.filter((s) => s !== goldSelector)], so the Footer keeps every other restriction. The src/lib/constants.ts 'off' override stays as it is. (5) Update docs/design.md:80 (CategoryTile no longer uses a gold focus outline) and note that focus rings on cream use primary.

**Files:** `src/features/catalog/components/ProductPurchasePanel.tsx`, `src/features/landing/components/BestSellersSection/BestSellersTabs.tsx`, `src/components/shared/ValuePropsBand/ValuePropCard.tsx`, `src/features/landing/components/DiscoverMoreSection/EditorialTile.tsx`, `src/features/landing/components/CatalogSection/CategoryTile.tsx`, `src/features/complaints/components/OtherContactMethods.tsx`, `eslint.config.mjs`, `docs/design.md`

**Test plan:** RED/GREEN via lint. Add the ESLint selector first: lint:strict fails on the existing usages (RED), then fix them (GREEN). Prove the override does not drop other rules: a temporary hex style literal in Footer.tsx must still fail lint; revert it before commit. Contrast values come from docs/design.md (gold-text 4.92:1 on cream). Check the price label in dev by selecting each variant.

**Acceptance:**
- lint:strict fails on any (text|outline)-(--color-secondary) class outside Footer.tsx
- Footer.tsx is still subject to the hex, business-data and z-index selectors
- No gold text or focus ring remains on a cream or white background
- After a variant is selected, the price shows the exact amount without 'Desde'
- docs/design.md reflects the focus-ring rule

**Checks:** `npm run lint:strict`, `npx tsc --noEmit`, `npx vitest run`, `rg -n "(text|outline)-\(--color-secondary\)" src (only Footer.tsx)`

**Risk:** Low. This is a visible style change on the landing tabs and the product page, and the user approved design changes. A broken override would silently weaken the lint rules, hence the explicit negative check.

**Commit:** `fix(design): enforce gold contrast rule and show exact variant price`

**Evidence:** RED: I added the gold selector to eslint.config.mjs first, before changing any component. Running `npx eslint src --max-warnings 0` then failed with 9 no-restricted-syntax errors: CatalogFeaturedCard.tsx:43, ValuePropCard.tsx:7 (module-level const Literal), BestSellersTabs.tsx:91,101,114, CategoryTi | checks: npm run lint:strict: exit 0, no errors or warnings; npx tsc --noEmit: exit 0; npx vitest run: 59 files, 786 tests passed; rg -n "(text|outline)-\(--color-secondary\)": only src/components/shared/Footer.tsx (11 matches); eslint --stdin --stdin-filename: 5 no-restricted-syntax errors raised as expected; Footer.tsx; npx react-doctor@latest --verbose: score 87; the warnings it lists are all in files this task d | verifier pass, tier medium | surface extended: 1) I widened the selector beyond the plan's JSXAttribute className Literal. It now matches `Literal[value=...]` and `Tem | deploy: None. This is a client-side style, copy-logic and lint-config change only. There are no schema changes, environment changes or new dependencies.

### T28: Delete Supabase-era dead code and the unused withAdminAuth wrapper

**Observations:**
- GEN:architecture-security:Dead legacy code from the Supabase era remains
- SEC-H:[h04-admin-authz] withAdminAuth passes rawInput unvalidated when schema is null; a schema should be required

**Approach:** Verified: src/lib/appwrite/types.ts has no importers, and withAdminAuth (src/features/admin/utils/auth.ts:64-102) has zero callers. src/lib/db/rows.ts is used only for HeroCtaType (HeroCanvasEditor/index.tsx:14 and HeroCanvasEditor/types.ts:1) and for the dead FlowerTypeRow and ProductColorRow re-exports (admin/queries/flowerTypes.ts:2-4 and productColors.ts:2-4). Delete src/lib/appwrite/types.ts and src/lib/db/rows.ts. Move HeroCtaType into src/lib/database/repositories/heroSlides/types.ts and export it as a type from that repository's index; the client imports it with `import type`, so the server-only modules are not pulled in. Delete withAdminAuth and its ZodSchema import, and drop the dead re-exports. rg every removed symbol before deleting.

**Files:** `src/lib/appwrite/types.ts`, `src/lib/db/rows.ts`, `src/features/admin/utils/auth.ts`, `src/features/admin/queries/flowerTypes.ts`, `src/features/admin/queries/productColors.ts`, `src/features/admin/components/HeroCanvasEditor/index.tsx`, `src/features/admin/components/HeroCanvasEditor/types.ts`, `src/lib/database/repositories/heroSlides/types.ts`, `src/lib/database/repositories/heroSlides/index.ts`

**Test plan:** A deletion with no behavior change has no RED. tsc --noEmit proves that nothing referenced the removed code, and vitest stays green.

**Acceptance:**
- src/lib/appwrite/types.ts and src/lib/db/rows.ts are deleted
- withAdminAuth is gone
- HeroCtaType is imported with import type from the heroSlides repository

**Checks:** `npm run lint:strict`, `npx tsc --noEmit`, `npx vitest run`, `rg -n "lib/db/rows|appwrite/types|withAdminAuth" src (expect no match)`

**Risk:** Low. Most of the changed lines are deletions.

**Commit:** `refactor: delete Supabase-era dead code and withAdminAuth`

**Evidence:** Exception: the task only deletes code and changes no behavior, so no test can fail first (no meaningful RED). Before deleting, rg showed no importers of src/lib/appwrite/types.ts and no callers of withAdminAuth. It also showed that FlowerTypeRow and ProductColorRow were used only by their own re-exp | checks: npm run lint:strict: exit 0, no warnings (eslint . --max-warnings 0); npx tsc --noEmit: exit 0, no errors; npx vitest run: 59 test files passed, 786 tests passed, exit 0; rg -n "lib/db/rows|appwrite/types|withAdminAuth": no matches (exit 1); npx react-doctor@latest --score: 87 with the change and 87 at baseline. No regression, and no | verifier pass, tier high | deploy: None. This is a type-only and dead-code deletion with no runtime, schema or console change.

### T29: Extract one orderable-home-collection helper for testimonials, discover tiles and value props

**Observations:**
- GEN:architecture-security:Orderable-content actions are copy-pasted, and their fallback-seeding behavior has drifted apart

**Approach:** testimonials.ts:71-137, discoverTiles.ts:75-146 and valueProps.ts:55-135 each redeclare readFromFallbackId, toWritePayload, activeCount, limitFailure, payloadFromFallback and seedFallbackDocuments. Testimonials seed sequentially with awaits in a loop, while discoverTiles uses Promise.all. Add src/features/admin/utils/orderableHomeCollection.ts, a plain module that is neither 'use server' nor under actions/. Keeping it out of actions/ means T11's Server Action auth guard never treats it as an action. It is parameterized by repository, fallback list, active limit with its copy, payload mapper and image resolver, and it seeds every fallback document in one store.runInTransaction, so a failure midway leaves nothing half-seeded. Each action file keeps its own 'use server' exports, requireAdmin, zod schema and AdminActionResult contract, and delegates the shared steps. The commit body records which variant's behavior won.

**Files:** `src/features/admin/utils/orderableHomeCollection.ts`, `src/features/admin/utils/orderableHomeCollection.test.ts`, `src/features/admin/actions/testimonials.ts`, `src/features/admin/actions/discoverTiles.ts`, `src/features/admin/actions/valueProps.ts`

**New files allowed in:** `src/features/admin/utils`

**Test plan:** RED/GREEN with vitest on the helper against fakeDocumentStore, written first. Seeding 3 fallbacks where the 2nd create fails leaves zero seeded documents (transaction rollback); the active limit returns the limit failure; reading a fallback id seeds once. T11's adminActionsAuth test keeps auth coverage on the three action files and must stay green.

**Acceptance:**
- The three action files share one helper, and no duplicated seed or limit functions remain
- Fallback seeding is all-or-nothing
- adminActionsAuth.test.ts stays green and still covers the three action files

**Checks:** `npm run lint:strict`, `npx tsc --noEmit`, `npx vitest run`, `rg -n "function seedFallbackDocuments|function limitFailure" src/features/admin/actions (expect no match)`

**Risk:** Medium. The behavior drift between the three copies must be reconciled deliberately.

**Commit:** `refactor(admin): share one orderable home collection helper`

**Evidence:** RED: I wrote src/features/admin/utils/orderableHomeCollection.test.ts first. `npx vitest run src/features/admin/utils/orderableHomeCollection.test.ts` failed with "Test Files 1 failed, Tests no tests" because ./orderableHomeCollection could not be resolved. GREEN: after I implemented the helper, the | checks: npm run lint:strict: exit 0, no warnings (the first run flagged 4 non-null assert; npx tsc --noEmit: exit 0, no errors; npx vitest run: 60 files passed, 801 tests passed, exit 0; rg -n "function: no match (rg exit 1), as expected; npx vitest run: 95 passed. 30 cases cover testimonials.ts, discoverTiles.ts  | verifier pass, tier medium | deploy: No schema or console change. Fallback seeding now uses the Appwrite transactions API (createTransaction and transactionId on createDocument). The existing appwriteProvider runInTransaction already uses that API for reorder and hero slides, so nothing new is needed in production.

### T30: Make filterProducts the single catalog filter engine with facet exclusion

**Observations:**
- GEN:architecture-security:Catalog filtering is implemented twice

**Approach:** CatalogCollection.tsx filterItems re-implements filterProducts (src/features/catalog/utils/filterProducts.ts:33-77), which SearchPage/applySearchQuery.ts uses. Extend filterProducts with categorySlugs: string[] (multi-select), priceMin and priceMax, colors, flowerTypes, and an optional `except` facet parameter, and keep the q search. Export it as a pure function over the T15 CatalogCardProduct type. CatalogCollection and applySearchQuery both call it, and the local filterItems is deleted. /buscar's single category maps to a one-element categorySlugs.

**Files:** `src/features/catalog/utils/filterProducts.ts`, `src/features/catalog/utils/filterProducts.test.ts`, `src/features/catalog/components/CatalogCollection.tsx`, `src/features/catalog/components/SearchPage/applySearchQuery.ts`

**New files allowed in:** `src/features/catalog/utils`

**Test plan:** RED/GREEN with vitest. Write filterProducts.test.ts first. The facet-exclusion cases (except='colors' ignores the color filter) are RED, because the parameter does not exist. Add price bounds using the priceTable minimum, multi-category, and the q match. GREEN after the extension, with both call sites compiling against it.

**Acceptance:**
- filterItems no longer exists in CatalogCollection.tsx
- The catalog and /buscar both filter through filterProducts
- Facet exclusion works for every facet

**Checks:** `npm run lint:strict`, `npx tsc --noEmit`, `npx vitest run`, `rg -n "function filterItems" src (expect no match)`

**Risk:** Low-medium. /buscar's single-category semantics must survive the mapping onto the multi-select shape.

**Commit:** `refactor(catalog): make filterProducts the single filter engine`

**Evidence:** RED: I wrote filterProducts.test.ts first (12 cases: no filter, multi-category, exact single category, price bounds on the priceTable minimum, q match on name/description/includes/occasion, omitted q, color and flower-type matching, and exclusion for category/price/colors/flowerTypes). `npx vitest r | checks: npm run lint:strict: pass (exit 0, 0 warnings). An earlier run flagged an unused ; npx tsc --noEmit: pass (exit 0); npx vitest run: pass: 61 files, 813 tests passed; rg -n "function: no match (exit 1), as expected; npx react-doctor@latest --verbose: Score 88/100, 8 issues. All 8 are in files this task did not | verifier pass, tier medium | deploy: None. This is a pure client/server refactor with no schema or console dependency.

### T31: Untangle feature boundaries: shared zod primitives to lib/validation and landing limit/identity rules into features/landing/rules, keeping lib free of feature imports

**Observations:**
- GEN:architecture-security:Feature boundaries are blurred: shared schemas live in admin, domain rules live in lib

**Approach:** complaints/schemas/complaint.ts imports primitives from features/admin/schemas/common.ts, and lib/ holds feature rules. (1) Move the generic primitives (nonEmptyString, optionalTrimmedString, longTextField, uuid, email, peruPhone, docNumber, priceVariant, nonNegativeInt, hexColor) to src/lib/validation/primitives.ts. admin/schemas/common.ts keeps slug, storedImageUrl and taxonomyName, and re-exports the moved primitives, so the admin schema files and actions that import './common' or 'schemas/common' do not change. complaint.ts imports from '@/lib/validation/primitives'. (2) Move testimonialLimit, valuePropLimit, discoverTileLimit and valuePropIdentity from src/lib to src/features/landing/rules/. Verified by rg: none of them is imported from src/lib, so no lib-to-features inversion appears. (3) promoPresetKey stays at src/lib/promoPresetKey.ts. It is imported by src/lib/database/repositories/promoBanners/presetOperations.ts, so moving it into features would invert the layering. It cannot move into the promoBanners repository index either, because the client PromoBannerList imports it at runtime, and that index pulls the server-only Appwrite client. (4) Keep the two Product types: the repository type is the persistence-facing domain, and the features/catalog Product is the public DTO. T32 records this in AGENTS.md. The importers to rewrite, from rg, are the files in this task's files list. Surface extended under the user standing authorization: src/lib/valuePropIdentity.test.ts, src/features/complaints/schemas/complaint.test.ts, src/features/complaints/components/ComplaintForm/ConsumerFields.tsx, src/features/complaints/components/ComplaintForm/DetailFields.tsx, src/features/complaints/components/ComplaintForm/ItemFields.tsx, src/features/complaints/actions/updateComplaint.ts, src/features/complaints/queries/complaints.ts, src/features/admin/components/ProductForm/FieldError.tsx, src/components/ui/FieldError.tsx, src/lib/auth/admin.ts, src/features/admin/utils/auth.ts. FieldError moves to src/components/ui/FieldError.tsx and the admin guard to src/lib/auth/admin.ts; the old modules stay as thin re-exports so other importers are unchanged.

**Files:** `src/lib/validation/primitives.ts`, `src/features/admin/schemas/common.ts`, `src/features/complaints/schemas/complaint.ts`, `src/lib/testimonialLimit.ts`, `src/lib/valuePropLimit.ts`, `src/lib/discoverTileLimit.ts`, `src/lib/valuePropIdentity.ts`, `src/features/landing/rules/testimonialLimit.ts`, `src/features/landing/rules/valuePropLimit.ts`, `src/features/landing/rules/discoverTileLimit.ts`, `src/features/landing/rules/valuePropIdentity.ts`, `src/app/(admin)/admin/inicio/page.tsx`, `src/app/(admin)/admin/inicio/descubrir/[id]/page.tsx`, `src/app/(admin)/admin/inicio/descubrir/nuevo/page.tsx`, `src/app/(admin)/admin/inicio/destacados/[id]/page.tsx`, `src/app/(admin)/admin/inicio/destacados/nuevo/page.tsx`, `src/app/(admin)/admin/inicio/testimonios/[id]/page.tsx`, `src/app/(admin)/admin/inicio/testimonios/nuevo/page.tsx`, `src/features/admin/actions/discoverTiles.ts`, `src/features/admin/actions/testimonials.ts`, `src/features/admin/actions/valueProps.ts`, `src/features/admin/components/DiscoverTileEditor/Fields.tsx`, `src/features/admin/components/DiscoverTileList/index.tsx`, `src/features/admin/components/TestimonialEditor/Fields.tsx`, `src/features/admin/components/TestimonialList/index.tsx`, `src/features/admin/components/ValuePropEditor/Fields.tsx`, `src/features/admin/components/ValuePropList/index.tsx`, `src/features/admin/schemas/valueProp.ts`, `src/features/landing/queries/getPublishedDiscoverTiles.ts`, `src/features/landing/queries/getPublishedTestimonials.ts`, `src/features/landing/queries/getPublishedValueProps.ts`, `src/lib/valuePropIdentity.test.ts`, `src/features/complaints/schemas/complaint.test.ts`, `src/features/complaints/components/ComplaintForm/ConsumerFields.tsx`, `src/features/complaints/components/ComplaintForm/DetailFields.tsx`, `src/features/complaints/components/ComplaintForm/ItemFields.tsx`, `src/features/complaints/actions/updateComplaint.ts`, `src/features/complaints/queries/complaints.ts`, `src/features/admin/components/ProductForm/FieldError.tsx`, `src/components/ui/FieldError.tsx`, `src/lib/auth/admin.ts`, `src/features/admin/utils/auth.ts`

**New files allowed in:** `src/lib/validation`, `src/features/landing/rules`

**Test plan:** A move-only refactor has no behavior RED. tsc proves the import rewiring, and the existing schema tests (T24 complaint.test.ts, T08 schema tests) stay green. Structural rg checks: nothing under src/features/complaints imports from features/admin, and nothing under src/lib imports from src/features.

**Acceptance:**
- complaint.ts imports no features/admin module
- src/lib contains no import of '@/features'
- The four landing rule modules live under src/features/landing/rules, and their old lib paths are deleted
- promoPresetKey stays in src/lib

**Checks:** `npm run lint:strict`, `npx tsc --noEmit`, `npx vitest run`, `rg -n "features/admin" src/features/complaints (expect no match)`, `rg -n "@/features" src/lib (expect no match)`

**Risk:** Low-medium. Wide import churn, so it lands late.

**Commit:** `refactor: move shared primitives to lib and landing rules to features`

**Evidence:** No behavioral RED applies, because this is a move-only refactor that changes no behavior (the test_plan says the same). The proof comes from tsc (the import rewiring compiles), the existing vitest suite staying GREEN (61 files, 813 tests, including complaint.test.ts and valuePropIdentity.test.ts at  | checks: npm run lint:strict: exit 0, no warnings; npx tsc --noEmit: exit 0, no errors; npx vitest run: 61 test files passed, 813 tests passed; rg -n "features/admin": no match (rc=1); rg -n "@/features": no match (rc=1); npx react-doctor@latest --verbose: score 86. The 8 warnings it lists are all in files this task | verifier pass, tier high | deploy: None. This is a code-only refactor, with no schema, environment or console changes.

### T32: Bring AGENTS.md in line with the code after the remediation

**Observations:**
- GEN:architecture-security:AGENTS.md architecture and contract text no longer matches the code

**Approach:** Edit AGENTS.md only; T23 already rewrote line 184. Make these changes. (1) Contracts (:143-147): document the real AdminActionResult {success, error, code, issues} (utils/auth.ts:13-27) and the login result {ok, code, error} with the RATE_LIMITED and FORBIDDEN codes; do not change them. (2) Tree and data (:127, :132): lib/appwrite/repositories becomes src/lib/database/repositories plus the DocumentStore port (increment, deleteExpired, create permissions); lib/db/rows.ts is gone; add src/lib/appwrite/ids.ts as the client-safe ids, src/lib/validation, src/lib/rateLimit (the 'rate_limits' collection with expires_at cleanup) and features/landing/rules. Note that lib must not import features. Record why two Product types exist. (3) Auth (:140, :158): the isAdmin check lives in src/lib/auth/appwriteProvider.ts; requireAdmin is cached and called in every admin query (T01) and in API routes; withAdminAuth is removed; the __Host-a_session cookie must be deleted with secure and path options; the root proxy.ts is removed; login has BotID and throttling. (4) Add a rule: modules that touch secrets import 'server-only' (shipped by next, aliased in vitest.config.ts), and client code imports Appwrite ids only from ids.ts. (5) Commands (:26-28): npm run test:e2e runs the local `playwright test`, and npm run doctor pins an exact react-doctor version. Add `npm run dev -- --experimental-https` for testing admin login in Safari, and add `npx vitest run` to the pre-commit line. (6) Complaints: correlativo_year is persisted, and printing uses a sandboxed srcdoc iframe. (7) CI: the ci.yml gate and the adminActionsAuth guard test. Keep :185, the combobox pattern, which T25 now implements fully.

**Files:** `AGENTS.md`

**Test plan:** Passive documentation, so no unit test applies. A structural readback checks that every src/ path named in AGENTS.md exists (a loop with fd or Test-Path over each path), and that the commands block matches the package.json scripts.

**Acceptance:**
- Every file path cited in AGENTS.md exists
- The documented action and login contracts match the code
- The commands block matches package.json scripts, and the Safari HTTPS note is present
- No references to withAdminAuth, lib/db/rows.ts, proxy.ts or react-doctor@latest remain

**Checks:** `npm run lint:strict`, `npx tsc --noEmit`, `npx vitest run`, `rg -n "withAdminAuth|db/rows|react-doctor@latest|proxy.ts" AGENTS.md (expect no stale match)`

**Risk:** Low.

**Commit:** `docs: align AGENTS.md with the remediated architecture`

**Evidence:** No unit test applies because this change only touches passive documentation (AGENTS.md), so there is no meaningful RED. The proportional check was a structural readback. The stale-term rg returned no matches (exit 1). A loop checked every path cited in backticks (src/, scripts/, tests/, docs/, .gith | checks: npm run lint:strict: exit 0, no warnings; npx tsc --noEmit: exit 0; npx vitest run: 61 test files, 813 tests passed, exit 0; rg -n "withAdminAuth|db/rows|react-doctor@latest|proxy.ts": no matches (exit 1), no stale references | verifier pass, tier medium | deploy: None. This is a documentation-only change.

### T33: Follow-up: clear react-doctor errors and warnings left after the remediation

**Observations:**
- Post-remediation npm run doctor reported 2 errors: effect-needs-cleanup at HorizontalScrollBar.tsx:39 and useScrollBehavior.ts:8. It also reported 20 warnings: await in a loop, sequential independent awaits, an effect that re-subscribes, high complexity, duplicated JSX, whole-props deps, transition-all, preventDefault, an array lookup in a loop, an empty default prop, and 4 accordion controls with no accessible label.
- T32 verifier: AGENTS.md (around line 89) still has the pre-existing voseo 'corregí la causa raíz'.

**Approach:** Fix each react-doctor finding at its root cause, without changing behavior.
- Add effect cleanups.
- Where an effect re-subscribes, use stable callbacks or refs.
- Run independent awaits in parallel with Promise.all where order does not matter. Where order or rate limits matter, keep them sequential and restructure instead.
- Hoist array lookups into a Map.
- Replace transition-all with explicit properties.
- Replace empty default props with module constants.
- Read individual props in deps instead of the whole props object.
- Give each filter accordion control an accessible name.
- Reduce DeleteCategoryDialog complexity by extracting pure helpers.
- Dedupe the IconPicker JSX with a map.
Change preventDefault on a form only when behavior stays the same; otherwise justify it in the commit body.
Change the AGENTS.md voseo to tuteo ('corrige la causa raíz').

**Files:** `scripts/lib/appwrite-provisioning.mjs`, `src/features/admin/utils/orderableHomeCollection.ts`, `src/app/(admin)/admin/inicio/testimonios/nuevo/page.tsx`, `src/features/landing/queries/getPublishedValueProps.ts`, `src/components/shared/Navbar/SearchOverlay/HorizontalScrollBar.tsx`, `src/components/shared/Navbar/useScrollBehavior.ts`, `src/features/admin/components/CategoryList/DeleteCategoryDialog.tsx`, `src/features/admin/components/DiscoverTileEditor/IconPicker.tsx`, `src/features/admin/components/ImageUploader.tsx`, `src/features/catalog/components/CatalogFilterSheet/index.tsx`, `src/features/admin/components/ProductForm/index.tsx`, `src/features/admin/components/SiteSettingsForm/index.tsx`, `src/features/admin/components/ProductTable/useProductSelection.ts`, `src/features/admin/components/PromoBannerEditor/Fields.tsx`, `src/features/catalog/components/CatalogFilterSheet/CategoryAccordion.tsx`, `src/features/catalog/components/CatalogFilterSheet/ColorAccordion.tsx`, `src/features/catalog/components/CatalogFilterSheet/FlowerTypeAccordion.tsx`, `src/features/catalog/components/CatalogFilterSheet/SortAccordion.tsx`, `AGENTS.md`

**New files allowed in:** `src/features/admin/components/CategoryList`, `src/features/admin/components/DiscoverTileEditor`

**Test plan:** Proportional checks: npm run doctor must report 0 errors. Aim for 0 warnings, and justify any warning that remains. Any pure helper you extract gets a unit test (RED, then GREEN).

**Acceptance:**
- npm run doctor reports 0 errors
- Every remaining react-doctor warning is justified in the commit body
- lint:strict, tsc and vitest stay green
- Behavior is unchanged, and AGENTS.md uses tuteo

**Checks:** `npm run lint:strict`, `npx tsc --noEmit`, `npx vitest run`, `npm run doctor -- --verbose`

**Risk:** Low: the React fixes are mechanical. Changing preventDefault can alter how a form submits, so do it carefully.

**Commit:** `refactor: clear react-doctor findings after audit remediation`

**Evidence:** I extracted pure helpers to src/features/admin/components/CategoryList/deleteDialogCopy.ts and wrote deleteDialogCopy.test.ts first. RED: `npx vitest run src/features/admin/components/CategoryList/deleteDialogCopy.test.ts` showed "Test Files 1 failed (1), Tests no tests" because the import of './del | checks: npm run lint:strict: exit 0, no warnings; npx tsc --noEmit: exit 0; npx vitest run: 62 files passed, 826 tests passed, exit 0; npm run doctor: Score 87/100, 0 errors, 3 warnings: duplicate-jsx-subtree at; node --check scripts/lib/appwrite-provisioning.mjs: exit 0 | verifier pass, tier medium | deploy: None. No schema, console or env changes. The provisioning script change only affects how --apply runs, which stays sequential; it was not executed.

### T34: Keep every file when several images are uploaded at once in ImageUploader

**Observations:**
- T33 writer: ImageUploader multi-upload calls onChange([...value, url]) once per file with the same stale value, so only the last of several simultaneously uploaded files is kept. This bug predates the remediation.

**Approach:** Collect every successful upload URL from one selection and call onChange once with the previous value plus all new URLs, in selection order. Alternatively, read the latest value through a ref or a functional update when the parent API allows it. Failed uploads must not drop successful ones. Extract a pure helper that merges the current URLs with the new ones (dedupe, keep order) and unit-test it. Keep the component's public props unchanged.

**Files:** `src/features/admin/components/ImageUploader.tsx`, `src/features/admin/utils/mergeUploadedUrls.ts`, `src/features/admin/utils/mergeUploadedUrls.test.ts`

**Test plan:** RED/GREEN: write the merge-helper test first; on the current code the helper does not exist, so the test is RED. Implement until GREEN. The component wiring is checked with tsc, lint and react-doctor.

**Acceptance:**
- When N files are selected and all upload, all N URLs are appended in selection order
- A failed upload does not discard the others
- ImageUploader props are unchanged
- The helper has unit tests

**Checks:** `npm run lint:strict`, `npx tsc --noEmit`, `npx vitest run`, `npm run doctor -- --verbose`

**Risk:** Low. If the component moves into a folder, every import path must keep resolving; prefer keeping ImageUploader.tsx in place and putting only the helper in the new directory.

**Commit:** `fix(admin): keep every image when uploading several at once`

**Evidence:** RED: I wrote src/features/admin/utils/mergeUploadedUrls.test.ts first. `npx vitest run src/features/admin/utils/mergeUploadedUrls.test.ts` failed with "Test Files 1 failed (1), Tests no tests" because the import './mergeUploadedUrls' could not be resolved (the module did not exist yet). GREEN: after | checks: npm run lint:strict: exit 0, no warnings; npx tsc --noEmit: exit 0; npx vitest run: exit 0; 63 test files passed, 833 tests passed; npm run doctor: exit 0; score 87, 3 warnings, none in the files I changed: d | verifier pass, tier medium | deploy: None. Client-side change only. No schema, console or environment change. | parent follow-up 7914133: guard detects new URLs instead of comparing list length (verifier minor issue).

### T35: Share one icon picker between the discover tile and value prop editors

**Observations:**
- T33 react-doctor: duplicate-jsx-subtree at DiscoverTileEditor/IconPicker.tsx:27, which is duplicated with ValuePropEditor/IconPicker.tsx:27

**Approach:** Create one shared presentational component, src/features/admin/components/IconPicker/index.tsx. It takes the icon options, the selected value, onChange and the labels as props. Turn both editor IconPickers into thin wrappers that pass their own icon sets and copy, or switch their callers to the shared component. Keep the same markup, radio semantics, accessible names, styles and behavior. One component per file, and no comments.

**Files:** `src/features/admin/components/DiscoverTileEditor/IconPicker.tsx`, `src/features/admin/components/ValuePropEditor/IconPicker.tsx`

**New files allowed in:** `src/features/admin/components/IconPicker`

**Test plan:** No DOM runner exists, so there is no meaningful RED. Proportional check: react-doctor no longer reports duplicate-jsx-subtree for the two IconPickers, and lint, tsc and vitest stay green.

**Acceptance:**
- react-doctor no longer reports duplicate-jsx-subtree for the IconPickers
- Both editors render the same options with the same accessible names and behavior
- No new dependency and no production comments

**Checks:** `npm run lint:strict`, `npx tsc --noEmit`, `npx vitest run`, `npm run doctor -- --verbose`

**Risk:** Low. A visual regression is possible if class names drift, so keep them identical.

**Commit:** `refactor(admin): share one icon picker across editors`

**Evidence:** I made a planned exception to test-first. There is no DOM test runner, so no meaningful RED test exists. As the proportional check, I ran react-doctor (`npm run doctor -- --verbose`, react-doctor@0.9.23) after the refactor. It reported no duplicate-jsx-subtree finding. Lint, tsc and vitest all passe | checks: npm run lint:strict: Passed (exit 0). The first run failed with a simple-import-s; npx tsc --noEmit: Passed (exit 0).; npx vitest run: Passed (exit 0): 63 test files and 833 tests.; npm run doctor: Score 86/100 with 2 warnings. No duplicate-jsx-subtree findi | verifier pass, tier medium | deploy: None. This is a frontend refactor only, with no schema, environment or console changes.

### T36: Stage fallback seeding writes sequentially inside the Appwrite transaction

**Observations:**
- T33 verifier: seedFallbacks stages tx.create calls concurrently with Promise.all against one Appwrite transactionId. Appwrite accepting concurrent staged operations on the same transaction is not proven, and the fake store cannot prove it.

**Approach:** In src/features/admin/utils/orderableHomeCollection.ts, stage the fallback creates one after another, keeping the explicit displayOrder. Write the loop so react-doctor does not flag await-in-loop: reduce over a promise chain, or use the same inSequence helper pattern as scripts/lib/appwrite-provisioning.mjs, local to this module. Add a unit test that proves the creates are staged strictly in order, with no overlap, through a fake transaction that records start and end. Leave the rest of the transaction semantics unchanged.

**Files:** `src/features/admin/utils/orderableHomeCollection.ts`, `src/features/admin/utils/orderableHomeCollection.test.ts`

**Test plan:** RED/GREEN: the new ordering test uses a fake tx.create that resolves asynchronously and records whether creates overlap. It is RED with the current Promise.all and GREEN once the creates are sequential.

**Acceptance:**
- Fallback creates are staged strictly one after another (the test proves no overlap)
- displayOrder and rollback behavior are unchanged
- react-doctor reports no await-in-loop for this file

**Checks:** `npm run lint:strict`, `npx tsc --noEmit`, `npx vitest run`, `npm run doctor -- --verbose`

**Risk:** Low. Seeding becomes slightly slower: the fallback lists are small and seeding is one-time.

**Commit:** `fix(admin): stage fallback seeding sequentially in the transaction`

**Evidence:** RED: I added the test 'stages the fallback creates one after another, never overlapping'. Its fake tx.create resolves after a setTimeout(0) and records in-flight count and start/end events. With Promise.all it failed: "AssertionError: expected 3 to be 1" at maxInFlight (1 failed, 15 passed). GREEN:  | checks: npm run lint:strict: exit 0, eslint --max-warnings 0 clean; npx tsc --noEmit: exit 0, no errors; npx vitest run: 63 files, 834 tests passed, exit 0; npm run doctor: exit 0, score 86/100. Only 2 warnings, both pre-existing no- | verifier pass, tier medium | deploy: None. Code-only change, with no schema or console dependency.

## Owner console checklist (not done by the agent)

- [ ] [SEC appwrite-acl:complaints-collection-unprovisioned-direct-api] Appwrite Console > Databases > kataleya > complaints > Settings: record Permissions and Document security. Expected: no read, create, update or delete for any, guests or users (empty, or team:admins only). If any of those roles has read, PII is exposed: remove the grant immediately. Also check Auth > Settings: disable anonymous sessions and email/password signup unless needed.
- [ ] [SEC appwrite-acl:counters-collection-unprovisioned-direct-api] Run the same check on 'counters' and its document complaints-<current year> ($permissions must be empty). After T06, consider a unique index on complaints (correlativo_year, correlativo), but only after confirming that legacy rows (correlativo_year null) cannot collide.
- [ ] [T04 prerequisite, before deploy] In database kataleya, create the collection 'rate_limits': integer 'count' (not required, default 0), datetime 'expires_at' (not required), a key index on expires_at, empty Permissions, Document security off. Or run scripts/provision-private-collections.mjs (T09) as a dry-run, then with --apply. Without it, complaints fail open and, from T05 on, admin login fails closed.
- [ ] [T06 prerequisite, before deploy] On collection complaints, create the integer attribute 'correlativo_year' (not required). Without it, every complaint insert fails with 'Unknown attribute'. T09's script creates it too.
- [ ] [T09 / SEC provision-home-content read-any] Run node scripts/provision-home-content.mjs and node scripts/provision-private-collections.mjs as a dry-run, review the diff, then rerun with --apply. Verify that the CMS collections (hero_slides, promo_banners, testimonials, discover_tiles, value_props, site_settings) no longer grant read(any): a GET /v1/databases/kataleya/collections/hero_slides/documents with only X-Appwrite-Project must return 401. Keep file read(any) on the content_images, product_images and category_images buckets; file listing stays possible by design.
- [ ] [SEC-H h15 endpoint/project public] The endpoint and project ID are public by design. Audit every collection and bucket for least privilege: the catalog collections need no client grants, and buckets grant only file read(any), with no create, update or delete for any or users.
- [ ] [SEC fileid-path-traversal blocker] Appwrite Console > Overview > API keys: scope APPWRITE_API_KEY to what the app uses (documents read/write, files read/write, buckets read, teams/memberships read, sessions write). Remove users.*, schema-level databases/collections write, functions and the rest.
- [ ] [GEN Admin login throttling / SEC-H h09 session lifetime / SEC-H h03 no session revocation] Appwrite Console > Auth > Security: enable password dictionary and password history, shorten the session length (for example to 7 days), set a session limit per user, enable 'invalidate sessions on password change', and enforce MFA for every member of the admins team. After T05 deploys, the owner logs in again, because the cookie is renamed to __Host-a_session.
- [ ] [SEC complaints relay / rate limit / login / searchProducts / slug route] Vercel > Firewall: add rate-limit rules for POST requests carrying the Next-Action header to /login and /libro-de-reclamaciones, plus a per-IP rate limit on /catalogo/* and on POSTs to public pages (the search action). Confirm Attack Challenge Mode is available, and set Spend Management caps for function usage.
- [ ] [SEC complaints relay / rate limit] Vercel BotID: enable Deep Analysis for /libro-de-reclamaciones and, after T05, for /login. Review BotID analytics for how scripted clients are classified.
- [ ] [SEC complaints rate limit] On a preview deployment, send one request with a forged X-Forwarded-For header and log what the server sees, to confirm that Vercel overwrites the header before relying on per-IP keys.
- [ ] [SEC-H h01 BotID NODE_ENV] Ensure every internet-exposed deployment runs with NODE_ENV=production (Vercel previews do by default), because BotID returns 'human' when it is not production. Protect preview deployments with Vercel Authentication.
- [ ] [SEC searchProducts / slug route / T07 cache size] Appwrite Console > Usage: record the plan's database read quota and what happens on overage, and compare the listDocuments graphs before and after T07. After deploy, search the Vercel runtime and build logs for 'items over 2MB can not be cached'. If it appears, the whole-catalog cache entry used by /catalogo, category pages and search has outgrown the data cache and needs a slimmer cached shape.
- [ ] [SEC complaints email relay] Resend dashboard: check daily and monthly volume, quota, rate limit and bounce/complaint rates for the sending domain, and set alerts. Confirm that the T04 per-recipient (3/24 h) and global consumer-copy (200/day) caps fit legitimate volume.
- [ ] [SEC-H h02 attribute sizes] Appwrite Console > complaints > Attributes: confirm that item_description, detail, consumer_request and provider_response hold at least 5000 characters, and consumer_name, consumer_email and guardian_name at least 255, matching the zod limits, so valid input cannot fail the insert after a correlativo is allocated.
- [ ] [SEC-H h09 HSTS preload] Before submitting the apex to hstspreload.org, confirm that every subdomain of kataleyaflowers.com serves HTTPS only (includeSubDomains plus preload in next.config.ts).
- [ ] [SEC-H h11 fork PR tokens / T11] GitHub > Settings > Actions: keep 'Send write tokens to workflows from fork pull requests' disabled. After T11, add a branch-protection rule on main that requires the new CI job.
- [ ] [T20 business data] Owner: confirm the district, postal code and Google Business Profile URL for Teodosio Parreño 115, and resolve the 'Florería Floritel' listing name. Set BUSINESS.postalAddress.district, postalCode and googleBusinessProfileUrl in src/lib/constants.ts (a code change by the agent once the values are known). Then validate the home and product pages with Google's Rich Results Test.

## Not fixing

- **GEN:seo:Name mismatch: the embedded Google Maps pin is a listing called 'Florería Floritel', not 'Kataleya Flowers'**: This needs a business decision. Only the owner knows which name is on the Google Business Profile at Teodosio Parreño 115, and whether to rename it or claim it as Kataleya Flowers. Code changes follow her answer: the alternateName and the T20 constants for district, postalCode and the GBP sameAs. The embed URL can be edited in the admin without a deploy.
- **GEN:seo:Florist LocalBusiness schema address fields (district as addressLocality, postalCode, Business Profile in sameAs): the concrete values**: Partially deferred. T20 derives every address field from src/lib/constants.ts and emits district, postalCode and the GBP URL as soon as they are set. The values themselves are business data that cannot be verified from the repository, so they stay null until the owner confirms them (console checklist). Guessing a district or postal code would publish wrong structured data.
- **SEC-H:[h09-platform-secrets] next.config.ts ships only Content-Security-Policy-Report-Only with unsafe-inline/unsafe-eval and no report-uri/report-to**: This needs a product and architecture decision. An enforced nonce-based CSP forces dynamic rendering of every page, which conflicts with the ISR prerendering that T14 restores, and collecting reports needs a reporting endpoint or a vendor choice. T13 already updates the Report-Only allowlist for GA, so scheduling enforcement later will not silently break analytics (AGENTS.md TODO Fase 6).
- **SEC-H:[h12-wildcard] updateComplaint lets any admin overwrite provider_response and reset responded_at with no audit trail**: This needs a legal and product decision. An append-only response history and a record of the acting admin need a new Appwrite collection or attributes, plus a decision on what the INDECOPI record must keep. The owner should confirm the retention requirements first.
- **SEC-H:[h04-admin-authz] isAdmin uses Query.limit(1) on listMemberships filtered by userId; keep the confirm check if refactored**: Not a defect. Verified at src/lib/auth/appwriteProvider.ts:53-60: the query filters by userId, and the result checks both membership.userId === userId and membership.confirm. This is guidance, not a finding.
- **SEC-H:[h05-admin-storage-fetch] image cleanup does no reference counting across records**: Disproportionate to the risk. The admin upload flow gives every record its own file, so a file is shared only if an admin manually pastes the same URL into two records. Reference counting would need a usage index across six collections for an admin-only integrity edge case.
- **SEC-H:[h01-complaints-abuse] checkBotId() runs before the rate limit, so rate-limited requests still make a BotID call**: Intentional after T04. The limiter becomes a durable Appwrite write, which is billed and adds latency, so the fail-closed BotID check stays the cheaper first gate, and only requests that pass BotID spend a limiter write.
- **SEC-H:[h02-complaints-integrity] the architecture note says correlativo is a read-modify-write; source uses incrementDocumentAttribute**: Already correct in the current code. Verified at src/lib/database/repositories/complaints/appwriteRepository.ts:119-157, which uses Appwrite's server-side incrementDocumentAttribute, atomic by Appwrite's guarantee. After T04, the same atomic call lives in DocumentStore.increment. Only the stale wording remains, and T32 refreshes AGENTS.md.

## Notes

Final plan: 32 tasks. Every critic item is applied, and the claims were checked against the code with read-only commands.

Critic resolutions:
- Missing observations:
  - h15 permissions: added to T04. create() takes { permissions }, and [] is passed for complaints, counters and rate_limits.
  - h12 stale-cookie clearing: added to T05. requireAdminOrRedirect sends the user to /login?session=ended, and a Server Action clears the cookie there; a layout cannot write cookies.
  - /buscar noindex when q is present: added to T18.
  - Florist address: added to T20. The fields are derived from new BUSINESS.postalAddress constants. The district, postal code and GBP values are pending the owner (console checklist and not_fixing).
- server-only, verified true:
  - node_modules/next/dist/compiled/server-only/{index,empty}.js exists.
  - next/dist/build/create-compiler-aliases.js:186-197 aliases 'server-only$' for both layers.
  - next/types/global.d.ts:57 declares the module.
  - node_modules/server-only is absent, so adding the import adds no npm dependency.
  - It is folded into T05 (5 modules plus a vitest resolve.alias). The not_fixing entry is removed.
  - T03 adds the prerequisite: src/lib/appwrite/ids.ts holds the client-safe ids, so no client module imports config.ts.
- Env split:
  - T03 splits a config-free parseStorageViewPath, used by imageLoader and isStoredImageSrc (T17) and by ogImageUrl (T21), from the server-only ownership check in ownership.ts.
  - Verified that StoredImage is 'use client' and that getAppwriteConfig() throws without the server env (config.ts:50-58).
- rate_limits growth: documents carry expires_at, a key index covers it, and DocumentStore.deleteExpired uses node-appwrite 26.2.0 deleteDocuments (verified at services/databases.d.ts:2050). The limiter purges expired windows best-effort whenever a hit opens a new window, which keeps the collection bounded. T09 provisions the attribute and index.
- Lima midnight (T06): the Lima year is computed once and persisted as correlativo_year, which needs a console attribute before deploy. formatComplaintNumber prefers the stored year. Legacy rows fall back to the UTC year of createdAt, which reproduces the numbers issued under the old UTC-server counter, so historical numbers never change.
- eslint flat config (T27): verified a single no-restricted-syntax block at eslint.config.mjs:139 and a constants.ts 'off' override at :235. The selectors are hoisted into a shared const array. The Footer override spreads the array minus the gold selector, and a negative lint check proves the other restrictions survive.
- T23 print: a hidden <iframe sandbox='allow-modals allow-same-origin' srcDoc> with no allow-scripts, printed through contentWindow.print(). No email HTML is injected into the page, and globals.css is removed from the files.
- Combobox (T25): AGENTS.md:185 is binding, so the roles stay and the pattern is completed: a listbox and options on desktop, aria-activedescendant, Arrow, Home, End, Enter and Escape, plus a pure, tested index helper.
- T29 helper: moved to src/features/admin/utils. T11's guard test also enumerates only 'use server' modules.
- T31 layering: promoPresetKey stays in lib. It is used by lib/database/repositories/promoBanners/presetOperations.ts and imported at runtime by the client PromoBannerList. Every rg-verified importer of the moved modules is now in the T31 files list, and the rg check 'no @/features in src/lib' is added.
- T32 scope: depends on T04, T05, T06, T11, T13, T23, T25, T28, T29 and T31. It lists the AGENTS.md:26-28 commands, the server-only rule and the Safari HTTPS note. Line :184 is handled in T23, and :185 is kept.
- T07 cache size: detail pages use per-slug unstable_cache entries tagged 'catalog-products', plus a cached active-category check, instead of the whole-catalog entry. The console checklist watches for Next's 'items over 2MB' warning. The test plan no longer asserts React cache() dedupe, which is a passthrough outside react-server in vitest.
- Safari __Host- cookie (T05): the cookie is kept Secure always. Local Safari testing uses `next dev --experimental-https`, which is built into Next and adds no dependency (documented in T32). It was also found that a bare cookies().delete(name) would emit a non-Secure Set-Cookie that browsers reject for __Host- names, so T05 deletes with secure and path options and tests it.
- Missing test files: added to T05, T08, T18 and T19, and to T06, T07, T25 and T26 where their plans named tests.
- Dependencies: every depends_on entry points to a lower id, and every pair of tasks that shares a file is ordered (for example T20 after T13 and T15, T21 after T14, T15 and T20, T06 after T05 for resendProvider.ts, T24 after T03 for common.ts, T26 after T05 for login/page.tsx, T31 after T08, T26 and T29). The tasks can run strictly in id order with one writer.

Production prerequisites, owner-run (in deploy_steps and console_checklist): rate_limits with count, expires_at and its index (T04), complaints.correlativo_year (T06), the provisioning dry-run and apply (T09), CI branch protection (T11), and re-login after the cookie rename (T05).

Forecast is about 7,400 authored lines. Tasks over the 400-line advisory, kept whole on purpose: T12 (640, mostly moved lines), T04 (480, one coherent port, limiter and wiring unit) and T03 (420, the parser split and its routes). T02 may touch next.config.ts only for renamed options; any new lint errors outside its files go back to the parent to extend the edit surface.

## Next step

All tasks done. The user merges fix/audit-remediation into dev and completes the owner console checklist.
