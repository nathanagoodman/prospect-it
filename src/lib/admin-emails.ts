/**
 * Admin email allowlist.
 *
 * Kept in its own module with no Node-only imports so both the Edge
 * middleware and server routes can use the same list — previously they
 * disagreed, which locked the founder out of /admin when ADMIN_EMAILS
 * was unset.
 */

const DEFAULT_ADMIN = "nathanagoodman@gmail.com";

export function adminAllowlist(): string[] {
  const raw =
    process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || DEFAULT_ADMIN;
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAllowlistedAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return adminAllowlist().includes(email.trim().toLowerCase());
}
