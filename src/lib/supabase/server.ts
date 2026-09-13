import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { getSupabaseEnv } from "./env";

/**
 * Supabase client for Server Components, Route Handlers, and Server Actions.
 * Reads/writes the session via the request's cookies. Only usable in a
 * server context (relies on next/headers `cookies()`).
 *
 * In a Server Component, cookie writes are silently ignored (Next.js does
 * not allow setting cookies from a render) — session refresh from a Server
 * Component is handled by `middleware.ts` instead.
 */
export async function createSupabaseServerClient() {
  const { url, anonKey } = getSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component render, where cookies cannot be
          // set — middleware.ts refreshes the session cookie instead.
        }
      },
    },
  });
}
