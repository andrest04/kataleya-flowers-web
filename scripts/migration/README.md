# Appwrite Migration Scripts

Offline tooling for the one-time Supabase → Appwrite data migration.
These scripts are **never imported by app code** and **never run in CI**.

## Prerequisites

- `node-appwrite` and `@supabase/supabase-js` are already project dependencies
- Run with `npx tsx <script>` (no additional install required)

## Required environment variables

| Variable | Used by | Description |
|---|---|---|
| `SUPABASE_URL` | export, seed-counter | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | export, seed-counter, seed-admins | Service-role key (bypasses RLS) |
| `APPWRITE_ENDPOINT` | import, seed-counter, seed-admins, verify | e.g. `https://cloud.appwrite.io/v1` |
| `APPWRITE_PROJECT_ID` | import, seed-counter, seed-admins, verify | Appwrite project ID |
| `APPWRITE_API_KEY` | import, seed-counter, seed-admins, verify | Server API key |

## Cutover runbook

### 1. Export Supabase data

```bash
SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
  npx tsx scripts/migration/export-supabase.ts
```

Writes JSON files to `scripts/migration/data/` (git-ignored — contains PII).

### 2. Dry-run import validation

```bash
APPWRITE_ENDPOINT=... APPWRITE_PROJECT_ID=... APPWRITE_API_KEY=... \
  npx tsx scripts/migration/import-appwrite.ts --dry-run
```

Validates all data files and field constraints without writing anything.
Fix any reported errors before proceeding.

### 3. Import into Appwrite

```bash
APPWRITE_ENDPOINT=... APPWRITE_PROJECT_ID=... APPWRITE_API_KEY=... \
  npx tsx scripts/migration/import-appwrite.ts
```

Idempotent — if a document already exists it is skipped. Safe to re-run after
a partial failure. Import order: categories → colors → flower types → products
→ images → assignments → complaints.

**Field constraints enforced:**
- `products.price_variants`: truncated to 4096 chars with a warning if exceeded.
  ⚠️ Truncation produces an UNPARSEABLE JSON string — if this warning fires,
  fix the product's `price_variants` in Supabase (or set it to null) and
  re-import BEFORE cutover; do not ship a truncated value.
- `complaints.provider_response`: **hard FAIL** if > 2000 chars (legal data)

### 4. Verify the import

```bash
APPWRITE_ENDPOINT=... APPWRITE_PROJECT_ID=... APPWRITE_API_KEY=... \
  npx tsx scripts/migration/verify.ts
```

Checks: row-count parity, spot samples (first/last product, category,
complaint), FK integrity (product → category), and counter values.
Exit 0 = all checks passed. Exit 1 = failures found.

### 5. Seed admin team memberships

```bash
SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
APPWRITE_ENDPOINT=... APPWRITE_PROJECT_ID=... APPWRITE_API_KEY=... \
  npx tsx scripts/migration/seed-admins.ts
```

Or with explicit email list (staging / override):

```bash
... npx tsx scripts/migration/seed-admins.ts --emails=admin@example.com
```

Note: `--dry-run` without `--emails` still requires the Supabase env vars
(admin emails are discovered from the Supabase export query). Combine
`--emails=... --dry-run` to preview without any Supabase credentials.

**Password note:** Supabase bcrypt hashes are not portable to Appwrite. Admin
accounts are created WITHOUT a password and must complete a password-reset flow
on first login. Notify all admins before cutover.

### 6. Seed correlativo counter (run immediately before deploy)

```bash
SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
APPWRITE_ENDPOINT=... APPWRITE_PROJECT_ID=... APPWRITE_API_KEY=... \
  npx tsx scripts/migration/seed-counter.ts
```

Sets `complaints-{YYYY}` counter to `max(correlativo)` for each year in
Supabase. Must run **immediately before** the production deploy that switches
`BACKEND=appwrite`, after the final export and import are done.

Idempotent: only raises the counter, never lowers it.

Dry-run: `... --dry-run` to preview values without writing.

### 7. Deploy with BACKEND=appwrite

Set BOTH `BACKEND=appwrite` and `NEXT_PUBLIC_BACKEND=appwrite` in the Vercel
environment variables and redeploy (they must always match — a mismatch
splits client/server auth paths; see `assertBackendConsistency`).

**Operational notes (correlativo / Libro de Reclamaciones):**
- A correlativo gap can occur if `insertComplaint` fails AFTER the counter
  increment (network/outage). This is equivalent to the previous Supabase
  behavior (Postgres IDENTITY sequences do not roll back either). Failures
  are logged via `[submitComplaint/appwrite]` — gaps are reconstructable
  from logs for any audit.
- The counter year bucket and the displayed `NNNNN-YYYY` both derive from
  UTC (Vercel has no TZ set). On Dec 31 ~19:00–24:00 Lima time the year
  rolls to the next UTC year. Consistent within each request; no action
  needed, just expected behavior.

### 8. Rollback

Revert `BACKEND` to `supabase` (or unset it) and redeploy the previous build.
Supabase stays in read-only mode for 2–4 weeks as a safety net. Complaints
written to Appwrite during the window must be exported back manually if rollback
fires (documented operational step).

## Data directory

`scripts/migration/data/` is git-ignored and may contain PII (complaint data).
Never commit it. Keep local copies only for as long as needed for verification.
