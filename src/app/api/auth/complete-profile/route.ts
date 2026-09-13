import { NextRequest, NextResponse } from "next/server";

import { profileFieldsSchema } from "../../../../lib/auth/profile-schema";
import { requireAuthenticatedUser } from "../../../../lib/auth/session";
import { prisma } from "../../../../lib/db/prisma";

/**
 * Recovers from the one signup failure mode where a Supabase Auth account
 * was created but the matching CarbonLoop `users` row was not (see the
 * catch block in ../signup/route.ts). This never needs a service-role key:
 * the caller is already authenticated as the account in question (they
 * signed in with the email/password they used at signup), so their own
 * Supabase Auth user ID — resolved server-side, never client-supplied — is
 * exactly the ID the missing profile row needs.
 *
 * Idempotent by design: if the profile row already exists, this returns
 * success without attempting to create it again, so retrying (e.g. a
 * double-click, or calling it when nothing was ever actually missing) is
 * always safe.
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuthenticatedUser();
    if (!authResult.ok) return NextResponse.json({ error: authResult.message }, { status: authResult.status });

    const existing = await prisma.user.findUnique({ where: { id: authResult.user.id } });
    if (existing) {
      return NextResponse.json({ userId: existing.id, alreadyComplete: true }, { status: 200 });
    }

    const parsed = profileFieldsSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request", details: parsed.error.issues }, { status: 400 });
    }

    try {
      await prisma.user.create({ data: { id: authResult.user.id, ...parsed.data } });
    } catch (profileError) {
      console.error("complete-profile: failed to create the CarbonLoop profile row:", profileError);
      return NextResponse.json({ error: "Unable to complete profile setup. Please try again." }, { status: 500 });
    }

    return NextResponse.json({ userId: authResult.user.id, alreadyComplete: false }, { status: 201 });
  } catch (error) {
    console.error("Error in /api/auth/complete-profile:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
