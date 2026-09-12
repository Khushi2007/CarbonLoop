import { NextResponse } from "next/server";
import { z } from "zod";

import { getCarbonRecord } from "../../../../lib/ledger/ledger";

const schema = z.object({ id: z.string().uuid() });
export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const parsed = schema.safeParse(await context.params);
  if (!parsed.success) return NextResponse.json({ error: "Invalid carbon record ID", details: parsed.error.issues }, { status: 400 });
  const record = await getCarbonRecord(parsed.data.id);
  return record ? NextResponse.json(record) : NextResponse.json({ error: "Carbon record not found" }, { status: 404 });
}
