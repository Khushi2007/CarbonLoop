import type { User as CarbonLoopUser, UserRole } from "@prisma/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export type { CarbonLoopUser, SupabaseUser, UserRole };

/**
 * Every auth/authorization helper returns this shape rather than throwing,
 * mirroring the existing domain modules' `{ code, message }` error pattern
 * (see src/lib/shipments/types.ts, src/lib/carbon/types.ts, etc.) so route
 * handlers can check `.ok` the same way they already check `"code" in
 * result`.
 */
export type AuthFailure = {
  ok: false;
  /** HTTP status the caller should respond with. */
  status: 401 | 403 | 404;
  code: "UNAUTHENTICATED" | "FORBIDDEN" | "PROFILE_NOT_FOUND";
  /** Safe to return to the client — never derived from an internal error message. */
  message: string;
};

export type AuthSuccess<T> = { ok: true; user: T };

export type AuthResult<T> = AuthSuccess<T> | AuthFailure;
