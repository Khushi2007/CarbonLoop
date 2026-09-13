import { NextResponse } from "next/server";

import { requireCarbonLoopUser } from "../../../../lib/auth/session";
import { listWasteLots } from "../../../../lib/waste-lots/waste-lots";

/**
 * Returns only the authenticated user's own waste lots (every status, not
 * just AVAILABLE — a generator should see all of their lots regardless of
 * lifecycle state here). The owning ID is always the server-resolved
 * session user — this route takes no request body and never reads a
 * `generatorId` from a query parameter, so a client cannot request another
 * user's lots by supplying a different ID.
 */
export async function GET() {
  try {
    const authResult = await requireCarbonLoopUser();
    if (!authResult.ok) return NextResponse.json({ error: authResult.message }, { status: authResult.status });

    const wasteLots = await listWasteLots({ status: "ALL", generatorId: authResult.user.id });
    return NextResponse.json({ wasteLots });
  } catch (error) {
    console.error("Error in /api/waste-lots/mine:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
