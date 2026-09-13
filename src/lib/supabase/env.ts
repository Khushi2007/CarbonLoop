/**
 * Central place that reads the two Supabase Auth environment variables and
 * fails with a clear, actionable message rather than a confusing downstream
 * crash if they are missing (e.g. Supabase Auth not yet configured for this
 * environment). Never import a service-role key here — this app only ever
 * uses the public anon key, from both the browser and the server.
 */
export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Supabase Auth is not configured: NEXT_PUBLIC_SUPABASE_URL and " +
        "NEXT_PUBLIC_SUPABASE_ANON_KEY must both be set. See .env.example."
    );
  }

  return { url, anonKey };
}
