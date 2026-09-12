import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { createShipment } from "../../../lib/shipments/shipments";

const schema = z.object({ wasteLotId: z.string().uuid(), facilityId: z.string().uuid() });
export async function POST(request: NextRequest) {
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid request", details: parsed.error.issues }, { status: 400 });
    const result = await createShipment(parsed.data.wasteLotId, parsed.data.facilityId);
    if (!("code" in result)) return NextResponse.json(result, { status: 201 });
    if (result.code === "NOT_FOUND") return NextResponse.json({ error: result.message }, { status: 404 });
    if (["NETWORK_ERROR", "INVALID_RESPONSE"].includes(result.code)) return NextResponse.json({ error: result.message }, { status: 502 });
    return NextResponse.json({ error: result.message }, { status: 422 });
  } catch { return NextResponse.json({ error: "Internal Server Error" }, { status: 500 }); }
}
