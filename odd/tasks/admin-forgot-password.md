# Admin forgot password

**Objective:** let an admin reset a forgotten password themselves, from a "¿Olvidaste tu contraseña?" link on `/login`.

**Problem:** today the only way to recover access is for the owner to change the password in the Appwrite console.

**Why:** the user decided on 2026-11-25 to implement self-service recovery. That reverses the earlier recommendation to keep using the console.

**Scope:**
- `/recuperar-contrasena` requests a recovery email.
- `/restablecer-contrasena?userId&secret` sets a new password.
- Recovery uses Appwrite `account.createRecovery` and `account.updateRecovery`. Appwrite sends the email itself, not Resend.

**Security design:**
- Responses are always generic, so the form never reveals whether an email exists.
- A recovery email is sent only to confirmed members of the `admins` team. Anyone else gets the same generic success and nothing is sent.
- Both actions are protected by BotID and run zod validation. They are throttled with the fail-closed limiter:
  - `recovery-ip` 10 requests per hour, `recovery-email` 3 requests per hour.
  - `reset-ip` 10 requests per 15 minutes.
- A successful reset revokes every session of that user with `users.deleteSessions`.
- The redirect origin comes from the `SITE_URL` env var, falling back to `BUSINESS.website`. It is never taken from the request `Host` header.
- The new password is entered twice and must have at least 8 characters, one uppercase letter, one number, one special character, and a zxcvbn-ts score of at least 3 (common + es-es dictionaries, userInputs `kataleya`/`flowers`). The 256-character maximum is enforced but never shown. Client and server share `features/admin/schemas/passwordPolicy.ts` and `passwordStrength.ts`.

**Constraints:**
- AGENTS.md is binding.
- No new dependencies.
- Zero comments in production code.
- No commits without explicit user approval (AGENTS.md overrides ODD work-unit commits).
- The agent never touches production Appwrite.
- Playwright e2e is never run.

**Console state (2026-11-25):**
- The agent registered the Web platforms `kataleyaflowers.com` and `www.kataleyaflowers.com`.
- `localhost` returned a 409: Appwrite refused to add it as a duplicate.
- Updating the API key through MCP was denied with a 403. The owner must add the `users.read` and `users.write` scopes to `kataleya-server-scoped` by hand.
- A custom template requires SMTP. Instead, `createAdminClient` now calls `setLocale('es')`, so Appwrite sends its built-in Spanish template.

**Owner console steps (original list):**
- Register the site domain (and `localhost` for dev) as a Web platform in Appwrite, so the recovery URL is accepted.
- Translate the Appwrite "Password recovery" email template to Spanish.

**Delivery strategy:** `exception-ok`. This is a single feature on `feat/admin-forgot-password` from `dev`.

**Forecast:** 3 tasks, about 450 authored changed lines.

**Review:** receipt-driven development is off (global), so no native review runs.

**Progress:** 4/4 implemented and verified. Not committed yet: waiting for the user to test it manually and approve, plus a pending decision on the confirmation copy.

**Verification (writer):**
- `npm run lint:strict`: exit 0.
- `npx tsc --noEmit`: exit 0.
- `npx vitest run`: 880 tests passed.
- `npm run doctor -- --scope changed`: 97/100.
- RED (33 failing) observed before GREEN.
- Parent spot check: the auth tests were re-run and all 76 passed.

**Accepted deviations:**
- The recovery email is sent in `after()` so response timing does not reveal which emails are admins.
- A malformed `userId` or `secret` returns `INVALID_LINK`.
- A 404 is mapped to `INVALID_LINK`.
- The API key needs the scopes `users.read`, `users.write` and `sessions.write`.

**Manual end-to-end check (user, 2026-11-25, localhost):**
- The recovery email arrived in Spanish.
- The link opened the reset page and the password change worked.
- This ran while T4 was in progress.

**Verification T4 (writer):**
- `npm run lint:strict`: exit 0.
- `npx tsc --noEmit`: exit 0.
- `npx vitest run`: 66 files, 913 tests passed.
- `npm run doctor -- --scope changed`: 97/100. The only warning is pre-existing (`ImageUploader.tsx:48`).
- Bundle size: not measured. `next build` was not run because the dev server shares `.next`. The zxcvbn dictionaries only load through the dynamic `import()` in `usePasswordStrength`.

**Not verified:** BotID path matching when the URL has a query string.

## Checklist

- [x] **T1** Auth port and Appwrite adapter: `requestPasswordRecovery` (admin-only send) and `completePasswordRecovery` (update, then revoke all sessions), with unit tests. _(route: delegated writer; trigger: 2+ non-trivial files)_
- [x] **T2** Server actions in `features/admin/actions/auth.ts`: BotID, zod, rate limits, generic results, with unit tests. _(route: same delegated writer)_
- [x] **T3** UI: login link, two `(auth)` pages, BotID protected paths, `SITE_URL` in `env.example`, AGENTS.md docs. _(route: same delegated writer)_

- [x] **T4** Password policy UX (user request 2026-11-25; scope extended the same day with zxcvbn-ts + Radix `Progress`):
  - Policy: at least 8 characters (the 256 maximum is enforced but not shown), one uppercase letter, one number and one special character, shared by client and server.
  - A live checklist shows each criterion and whether the two passwords match.
  - A strength bar.
  - The submit button is disabled until every criterion is met and the passwords match.
  - The button label is "Cambiar contraseña".
  - The user approved new dependencies, pinned exact: `@zxcvbn-ts/core@4.2.0`, `@zxcvbn-ts/language-common@4.1.3` and `@zxcvbn-ts/language-es-es@4.1.2`. These are older than 4.3.0, which was released only 11 days earlier.
  - The bar uses `Progress` from the existing `radix-ui` package.
  - The zxcvbn score must be at least 3, on both client and server.
  - zxcvbn is lazy-loaded on the client.
  - _(route: delegated writer; trigger: 2+ non-trivial files)_
  - Done: `passwordPolicy.ts` (criteria, labels, zod schema, client-safe), `passwordStrength.ts` (zxcvbn factory configured once, `strongPasswordSchema` used by `resetPasswordAction`), `usePasswordStrength` (dynamic `import()` on first keystroke; `unavailable` fallback lets the 4 criteria gate the button and the server decide), `usePasswordRequirements`, `PasswordStrengthMeter` (Radix `Progress` + text label + zxcvbn Spanish warning), `PasswordCriteriaList` / `PasswordCriterionItem` (lucide `Check`/`Circle`, sr-only state, one polite status when everything passes). Button "Cambiar contraseña", disabled until all requirements pass, `aria-describedby` → checklist.
  - Decision: `useLevenshteinDistance` stays off. With it, a check took ~150–550 ms per keystroke; without it, 5–45 ms, and common passwords still score below 3.
  - Evidence: RED observed twice (missing module/exports, then "easy to guess" accepted), then GREEN. See verification below.

## Acceptance criteria

- An unknown or non-admin email returns the same success message as an admin email.
- An invalid or expired link, or a weak password, returns a clear Spanish error.
- After a successful reset, the admin is sent to `/login` and old sessions no longer work.
- `npm run lint:strict`, `npx tsc --noEmit` and `npx vitest run` pass.

## Checks

`npm run lint:strict` · `npx tsc --noEmit` · `npx vitest run`

## Next step

T1–T3 via one delegated writer.
