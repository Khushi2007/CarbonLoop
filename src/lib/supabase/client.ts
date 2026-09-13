"use client";

import { createBrowserClient } from "@supabase/ssr";

import { getSupabaseEnv } from "./env";

/**
 * Supabase client for Client Components (login/signup forms). Session
 * cookies are managed automatically by @supabase/ssr's browser adapter and
 * are then refreshed on subsequent requests by middleware.ts.
 */
export function createSupabaseBrowserClient() {
  const { url, anonKey } = getSupabaseEnv();
  return createBrowserClient(url, anonKey);
}
