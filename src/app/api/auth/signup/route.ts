import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "../../../../lib/db/prisma";
import { profileFieldsSchema } from "../../../../lib/auth/profile-schema";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";

const schema = profileFieldsSchema.extend({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(request: NextRequest) {
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request", details: parsed.error.issues }, { status: 400 });
    }
    const { email, password, name, role, organization, latitude, longitude } = parsed.data;

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error || !data.user) {
      // Supabase's own message (e.g. "User already registered", weak
      // password) is safe to surface — it never contains internal details.
      return NextResponse.json({ error: error?.message ?? "Unable to create account." }, { status: 422 });
    }

    try {
      await prisma.user.create({
        data: { id: data.user.id, name, role, organization, latitude, longitude },
      });
    } catch (profileError) {
      // The Supabase Auth account now exists but the CarbonLoop profile row
      // does not. We do not have (and deliberately do not introduce) a
      // service-role client able to delete the orphaned auth account here,
      // and retrying this same signup form will now fail with Supabase's own
      // "User already registered" error rather than fixing anything.
      //
      // The account itself is valid, though: the user can sign in with the
      // email/password they just used (Supabase Auth already has that
      // identity), and POST /api/auth/complete-profile — authenticated by
      // that same session, no service-role key required — creates the
      // missing profile row using their own already-authenticated identity.
      // `recoverable: true` lets a client route the user there directly
      // instead of just displaying the message.
      console.error("Signup: Supabase Auth account created but CarbonLoop profile creation failed:", profileError);
      return NextResponse.json(
        {
          error:
            "Your account was created, but profile setup did not finish. Sign in with the email and password you just used, then retry profile setup to finish creating your CarbonLoop account.",
          recoverable: true,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { userId: data.user.id, emailConfirmationRequired: data.session === null },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in /api/auth/signup:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
