/**
 * Seed admin users into the Appwrite `admins` Team.
 *
 * Reads admin emails from Supabase `admin_users` (or from --emails flag),
 * creates Appwrite user accounts if they do not exist, then adds each to the
 * `admins` team. Existing memberships are skipped idempotently.
 *
 * Password handling:
 *   Supabase bcrypt hashes are NOT compatible with Appwrite's password format.
 *   Users are created WITHOUT a password, which forces a password-reset email
 *   on first login. This is the documented fallback for the small admin set
 *   (see design D8 and spec Requirement: Migration Completeness and Rollback).
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *   APPWRITE_ENDPOINT=... APPWRITE_PROJECT_ID=... APPWRITE_API_KEY=... \
 *     npx tsx scripts/migration/seed-admins.ts
 *
 * Flags:
 *   --emails=a@b.com,c@d.com   Override the Supabase admin list with explicit
 *                              comma-separated emails (useful for staging).
 *   --dry-run                  Print what would be done without writing.
 */

import { AppwriteException, ID, Query } from 'node-appwrite';

import {
  APPWRITE_TEAM_ADMINS_ID,
  createAdminClient,
} from './lib/appwrite-client';
import { getSupabaseClient } from './lib/supabase-client';

const DRY_RUN = process.argv.includes('--dry-run');

/** Extracts --emails=... value from argv, or returns null. */
function parseEmailsFlag(): string[] | null {
  const arg = process.argv.find((a) => a.startsWith('--emails='));
  if (!arg) return null;
  const value = arg.slice('--emails='.length).trim();
  return value ? value.split(',').map((e) => e.trim()).filter(Boolean) : null;
}

interface AdminUserRow {
  user_id: string;
  email: string | null;
}

async function getAdminEmails(): Promise<string[]> {
  const override = parseEmailsFlag();
  if (override) {
    console.log(`Using --emails flag: ${override.join(', ')}`);
    return override;
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('admin_users')
    .select('user_id, email');

  if (error) throw new Error(`Supabase fetch failed: ${error.message}`);

  const emails = (data as AdminUserRow[])
    .map((r) => r.email)
    .filter((e): e is string => typeof e === 'string' && e.length > 0);

  if (emails.length === 0) {
    throw new Error(
      'No admin emails found in Supabase admin_users. ' +
      'Use --emails=a@b.com,c@d.com to specify them explicitly.',
    );
  }

  return emails;
}

interface AppwriteUserLookup {
  $id: string;
  email: string;
}

/** Returns the Appwrite user id for an email, or null if not found. */
async function findUserByEmail(
  users: ReturnType<typeof createAdminClient>['users'],
  email: string,
): Promise<string | null> {
  const list = await users.list([Query.equal('email', [email])]);
  if (list.users.length === 0) return null;
  return (list.users[0] as AppwriteUserLookup).$id;
}

/** Creates an Appwrite user without a password (forces password-reset flow). */
async function createUser(
  users: ReturnType<typeof createAdminClient>['users'],
  email: string,
): Promise<string> {
  const user = await users.create(
    ID.unique(),
    email,
    undefined, // phone — not used
    undefined, // password — intentionally omitted; user must set via reset
    email.split('@')[0], // name — simple default, operator can update
  );
  return (user as AppwriteUserLookup).$id;
}

interface MembershipModel {
  userId: string;
}

/** Returns true if userId is already a member of the admins team. */
async function isAlreadyMember(
  teams: ReturnType<typeof createAdminClient>['teams'],
  userId: string,
): Promise<boolean> {
  try {
    const memberships = await teams.listMemberships(
      APPWRITE_TEAM_ADMINS_ID,
      [Query.equal('userId', [userId])],
    );
    return memberships.memberships.some(
      (m) => (m as MembershipModel).userId === userId,
    );
  } catch (err) {
    if (err instanceof AppwriteException && err.code === 404) return false;
    throw err;
  }
}

async function main(): Promise<void> {
  if (DRY_RUN) {
    console.log('[DRY RUN] Planning admin seeding — no writes will occur.\n');
  }

  const emails = await getAdminEmails();
  console.log(`\nAdmin emails to seed: ${emails.join(', ')}\n`);

  if (DRY_RUN) {
    console.log('[DRY RUN] Would ensure each email has an Appwrite account and admins team membership.');
    console.log('Note: accounts without a password require a password-reset email on first login.');
    return;
  }

  const { users, teams } = createAdminClient();

  for (const email of emails) {
    process.stdout.write(`  ${email.padEnd(50)} `);

    let userId = await findUserByEmail(users, email);

    if (!userId) {
      userId = await createUser(users, email);
      process.stdout.write(`created user ${userId}  `);
    } else {
      process.stdout.write(`existing user ${userId}  `);
    }

    const alreadyMember = await isAlreadyMember(teams, userId);

    if (alreadyMember) {
      console.log('already in admins team — skipped');
    } else {
      await teams.createMembership(
        APPWRITE_TEAM_ADMINS_ID,
        [], // roles — empty, membership is the auth signal
        undefined, // url — not needed for server-side membership
        userId,
        undefined, // phone
        undefined, // name
        email,
      );
      console.log('added to admins team');
    }
  }

  console.log('\nAdmin seeding complete.');
  console.log(
    'Each new admin must complete a password-reset flow before logging in ' +
    '(Supabase bcrypt hashes are not portable).',
  );
}

main().catch((err: unknown) => {
  console.error('seed-admins failed:', err instanceof Error ? err.message : String(err));
  process.exit(1);
});
