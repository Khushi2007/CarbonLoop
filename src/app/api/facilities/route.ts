import { FacilityStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { listFacilities } from "../../../lib/facilities/facilities";

const FACILITY_STATUS_VALUES = Object.values(FacilityStatus) as [FacilityStatus, ...FacilityStatus[]];
const querySchema = z.object({
  status: z.union([z.enum(FACILITY_STATUS_VALUES), z.literal("ALL")]).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const parsed = querySchema.safeParse({ status: request.nextUrl.searchParams.get("status") ?? undefined });
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid query parameters", details: parsed.error.issues }, { status: 400 });
    }

    const facilities = await listFacilities({ status: parsed.data.status });
    return NextResponse.json({ facilities });
  } catch (error) {
    console.error("Error in /api/facilities:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
