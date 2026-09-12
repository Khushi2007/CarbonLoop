import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { completeShipment } from "../../../../../lib/shipments/shipments";

const schema = z.object({ id: z.string().uuid() });
export async function POST(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const parsed = schema.safeParse(await context.params);
  if (!parsed.success) return NextResponse.json({ error: "Invalid shipment ID", details: parsed.error.issues }, { status: 400 });
  const result = await completeShipment(parsed.data.id);
  if (!("code" in result)) return NextResponse.json(result, { status: 200 });
  if (result.code === "NOT_FOUND") return NextResponse.json({ error: result.message }, { status: 404 });
  // Unexpected infrastructure failures are surfaced generically — never the underlying
  // error message — so internal details are never exposed to the caller.
  if (result.code === "INTERNAL_ERROR") return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  return NextResponse.json({ error: result.message }, { status: 422 });
}
