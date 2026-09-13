import { prisma } from "../db/prisma";
import { createSupabaseServerClient } from "../supabase/server";
import type { AuthResult, CarbonLoopUser, SupabaseUser, UserRole } from "./types";

let warnedMissingConfig = false;

/**
 * Returns the authenticated Supabase Auth user for the current request, or
 * `null` if there is no valid session. Uses `getUser()` (not `getSession()`)
 * so the identity is revalidated against the Supabase Auth server rather
 * than trusted from a locally-decoded, unverified cookie — this is the
 * security-sensitive choice recommended by Supabase for server-side checks.
 *
 * If Supabase Auth environment variables are not configured, this resolves
 * to `null` (treated as "not signed in") rather than throwing, so every
 * existing public page — which calls this indirectly via layout.tsx to
 * render the header — keeps working exactly as it did before Stage 7 until
 * Supabase Auth is configured. Authenticated/role-restricted operations
 * still correctly fail closed (401) in that state; they simply cannot yet
 * succeed for anyone, which is the safe default for missing configuration.
 */
export async function getAuthenticatedUser(): Promise<SupabaseUser | null> {
  let supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
  try {
    supabase = await createSupabaseServerClient();
  } catch (error) {
    if (!warnedMissingConfig) {
      console.warn("Supabase Auth is not configured — treating all requests as unauthenticated:", error);
      warnedMissingConfig = true;
    }
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** Same as `getAuthenticatedUser()`, but as a typed 401 failure when absent. */
export async function requireAuthenticatedUser(): Promise<AuthResult<SupabaseUser>> {
  const user = await getAuthenticatedUser();
  if (!user) {
    return { ok: false, status: 401, code: "UNAUTHENTICATED", message: "Authentication required." };
  }
  return { ok: true, user };
}

/**
 * Resolves the authenticated Supabase Auth session to the corresponding
 * CarbonLoop `users` row (the canonical domain identity — see
 * prisma/schema.prisma). This is the function API routes and Server
 * Components should call to get "who is making this request" as a real
 * domain user with a `role`, never a client-supplied ID.
 *
 * A session that authenticates successfully but has no matching `users` row
 * is a genuine inconsistency (e.g. the profile-creation half of signup
 * failed) rather than a normal "logged out" state, so it is reported as 404
 * PROFILE_NOT_FOUND rather than folded into 401.
 */
export async function getCurrentCarbonLoopUser(): Promise<AuthResult<CarbonLoopUser>> {
  const authResult = await requireAuthenticatedUser();
  if (!authResult.ok) return authResult;

  const user = await prisma.user.findUnique({ where: { id: authResult.user.id } });
  if (!user) {
    return {
      ok: false,
      status: 404,
      code: "PROFILE_NOT_FOUND",
      message: "No CarbonLoop profile exists for this account yet.",
    };
  }

  return { ok: true, user };
}

/**
 * Checks that `user` has one of the `allowedRoles`. Never trust a role
 * supplied by the browser — always call this with the `CarbonLoopUser` that
 * `getCurrentCarbonLoopUser()` resolved server-side from the session.
 */
export function requireRole(user: CarbonLoopUser, allowedRoles: UserRole[]): AuthResult<CarbonLoopUser> {
  if (!allowedRoles.includes(user.role)) {
    return {
      ok: false,
      status: 403,
      code: "FORBIDDEN",
      message: "You do not have permission to perform this action.",
    };
  }
  return { ok: true, user };
}

/**
 * Convenience composition of `getCurrentCarbonLoopUser()` +
 * `requireRole()` for the common case of "this endpoint needs a signed-in
 * user with one of these roles". Omit `allowedRoles` to only require
 * authentication.
 */
export async function requireCarbonLoopUser(allowedRoles?: UserRole[]): Promise<AuthResult<CarbonLoopUser>> {
  const userResult = await getCurrentCarbonLoopUser();
  if (!userResult.ok) return userResult;
  if (!allowedRoles) return userResult;
  return requireRole(userResult.user, allowedRoles);
}
