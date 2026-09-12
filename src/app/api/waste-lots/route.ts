import { WasteLotStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { listWasteLots } from "../../../lib/waste-lots/waste-lots";

const WASTE_LOT_STATUS_VALUES = Object.values(WasteLotStatus) as [WasteLotStatus, ...WasteLotStatus[]];
const querySchema = z.object({
  status: z.union([z.enum(WASTE_LOT_STATUS_VALUES), z.literal("ALL")]).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const parsed = querySchema.safeParse({ status: request.nextUrl.searchParams.get("status") ?? undefined });
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid query parameters", details: parsed.error.issues }, { status: 400 });
    }

    const wasteLots = await listWasteLots({ status: parsed.data.status });
    return NextResponse.json({ wasteLots });
  } catch (error) {
    console.error("Error in /api/waste-lots:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
