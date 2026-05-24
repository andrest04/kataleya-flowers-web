-- =============================================================================
-- Revoke is_admin() EXECUTE from anon and PUBLIC
--
-- The original migration (20260515000001) mistakenly granted EXECUTE on
-- is_admin(uuid) to the anon role, allowing unauthenticated callers to probe
-- admin membership via RPC. This migration corrects that for already-deployed
-- environments without re-running the original migration.
-- =============================================================================

REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;
