import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getSupabaseEnv } from "./lib/supabase/env";

/** Paths that require an authenticated session. Everything else (including
 * every existing public page and read-only API route from Stages 1-6)
 * remains publicly reachable — this stage only gates the new
 * authenticated/ownership-aware surfaces. */
const PROTECTED_PATH_PREFIXES = ["/dashboard", "/waste-lots/new"];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATH_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function redirectToLogin(request: NextRequest): NextResponse {
  const redirectUrl = new URL("/login", request.url);
  redirectUrl.searchParams.set("redirect", request.nextUrl.pathname);
  return NextResponse.redirect(redirectUrl);
}

/**
 * Next.js 16 renamed the request-interception convention from
 * `middleware.ts`/`export function middleware` to `proxy.ts`/`export
 * function proxy` (see https://nextjs.org/docs/messages/middleware-to-proxy).
 * This project targets Next.js 16.3.5, so this file uses the current
 * convention. Because this project uses a `src/` directory (`src/app`),
 * this file lives at `src/proxy.ts`, mirroring where `src/middleware.ts`
 * would have been required under the older convention.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  // If Supabase Auth isn't configured yet, nobody can have a real session —
  // conservatively treat every request as unauthenticated (still redirect
  // protected paths) rather than skipping protection entirely. Only the
  // session-refresh call below is skipped, since it has nothing to talk to.
  let url: string, anonKey: string;
  try {
    ({ url, anonKey } = getSupabaseEnv());
  } catch {
    return isProtectedPath(request.nextUrl.pathname) ? redirectToLogin(request) : response;
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
      },
    },
  });

  // getUser() (not getSession()) revalidates against the Supabase Auth
  // server and also refreshes an expiring session cookie as a side effect.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && isProtectedPath(request.nextUrl.pathname)) {
    return redirectToLogin(request);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
