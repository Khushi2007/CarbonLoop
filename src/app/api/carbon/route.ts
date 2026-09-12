import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { calculateCarbonImpact } from "../../../lib/carbon/carbon";

const requestSchema = z.object({
  wasteLotId: z.string().uuid(),
  facilityId: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  try {
    const parsed = requestSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid request", details: parsed.error.issues }, { status: 400 });

    const result = await calculateCarbonImpact(parsed.data.wasteLotId, parsed.data.facilityId);
    if (!("code" in result)) return NextResponse.json(result, { status: 200 });

    switch (result.code) {
      case "NOT_FOUND": return NextResponse.json({ error: result.message }, { status: 404 });
      case "NETWORK_ERROR":
      case "INVALID_RESPONSE": return NextResponse.json({ error: result.message }, { status: 502 });
      default: return NextResponse.json({ error: result.message }, { status: 422 });
    }
  } catch (error) {
    console.error("Error in /api/carbon:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
