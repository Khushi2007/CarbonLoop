/**
 * Shared safety guard for the destructive database-integration test suite.
 *
 * Several integration test files call deleteMany()/full-table wipes and
 * upsert seed data as part of their setup and teardown. That is only safe
 * against a disposable database — never against the shared Supabase demo
 * project that the running application (and anyone watching a live demo)
 * depends on.
 *
 * Every DB-integration test file must call `resolveDatabaseIntegrationMode()`
 * at module scope (not inside a `describe`/`it` callback) so an unsafe target
 * fails loudly during test collection, before any `beforeAll` hook — and
 * therefore before any destructive Prisma call — has a chance to run.
 */

const LOCALHOST_HOSTNAMES = new Set(["localhost", "127.0.0.1", "::1"]);

function extractHost(databaseUrl: string): string {
  try {
    return new URL(databaseUrl).hostname;
  } catch {
    return "";
  }
}

/**
 * Hosts a developer has explicitly opted into via TEST_DATABASE_HOST_ALLOWLIST
 * (comma-separated hostnames, or substrings of a hostname). This is the only
 * way a non-localhost target — e.g. a dedicated Supabase *test* project — is
 * ever allowed to run the destructive suite.
 */
function isExplicitlyAllowlisted(host: string): boolean {
  const allowlist = process.env.TEST_DATABASE_HOST_ALLOWLIST;
  if (!host || !allowlist) return false;
  return allowlist
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .some((entry) => host === entry || host.includes(entry));
}

/**
 * Returns whether the destructive DB-integration suite should run.
 *
 * - Returns `false` when `RUN_DATABASE_TESTS` isn't `"true"` — the suite
 *   stays skipped, exactly as before this guard existed.
 * - Throws immediately when `RUN_DATABASE_TESTS === "true"` but the resolved
 *   `DATABASE_URL` is missing or does not resolve to a known-safe host. This
 *   never silently falls back to skipping — an operator who deliberately
 *   opted in gets a loud, explanatory failure instead of a quiet no-op.
 */
export function resolveDatabaseIntegrationMode(): boolean {
  if (process.env.RUN_DATABASE_TESTS !== "true") return false;

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(
      "RUN_DATABASE_TESTS=true but DATABASE_URL is not set. Destructive integration tests " +
        "require an explicit, disposable test database — refusing to run."
    );
  }

  const host = extractHost(databaseUrl);
  if (LOCALHOST_HOSTNAMES.has(host) || isExplicitlyAllowlisted(host)) {
    return true;
  }

  throw new Error(
    `Refusing to run destructive DB integration tests against database host "${host || "(unparseable DATABASE_URL)"}".\n` +
      "These tests call deleteMany()/full-table wipes and must never target the shared Supabase demo database.\n\n" +
      "To run this suite safely:\n" +
      "  1. Point DATABASE_URL at a disposable local Postgres+PostGIS instance (host localhost/127.0.0.1), or\n" +
      "  2. If you use a dedicated Supabase *test* project, add its hostname to TEST_DATABASE_HOST_ALLOWLIST\n" +
      "     (comma-separated) to explicitly opt in.\n\n" +
      "See README.md, \"Running the database integration test suite safely\", for setup steps."
  );
}
