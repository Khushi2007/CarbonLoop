import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "../../../../lib/supabase/server";

export async function POST() {
  try {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error in /api/auth/logout:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
