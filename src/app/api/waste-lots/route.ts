import { UserRole, WasteLotStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireCarbonLoopUser } from "../../../lib/auth/session";
import { createWasteLot, listWasteLots } from "../../../lib/waste-lots/waste-lots";

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

// Deliberately does NOT accept a `generatorId` field — ownership is always
// derived from the authenticated session (see requireCarbonLoopUser below),
// never from the request body.
const createSchema = z.object({
  wasteType: z.string().min(1).max(100),
  quantityTonnes: z.number().positive(),
  moisturePercent: z.number().min(0).max(100).optional(),
  qualityScore: z.number().min(0).max(100).optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  availableFrom: z.coerce.date(),
});

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireCarbonLoopUser([UserRole.GENERATOR, UserRole.ADMIN]);
    if (!authResult.ok) return NextResponse.json({ error: authResult.message }, { status: authResult.status });

    const parsed = createSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request", details: parsed.error.issues }, { status: 400 });
    }

    const wasteLot = await createWasteLot({ ...parsed.data, generatorId: authResult.user.id });
    return NextResponse.json({ wasteLot }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/waste-lots:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
