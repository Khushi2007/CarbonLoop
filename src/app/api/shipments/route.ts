import { UserRole } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireCarbonLoopUser } from "../../../lib/auth/session";
import { prisma } from "../../../lib/db/prisma";
import { createShipment } from "../../../lib/shipments/shipments";

const schema = z.object({ wasteLotId: z.string().uuid(), facilityId: z.string().uuid() });
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireCarbonLoopUser([UserRole.GENERATOR, UserRole.ADMIN]);
    if (!authResult.ok) return NextResponse.json({ error: authResult.message }, { status: authResult.status });

    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid request", details: parsed.error.issues }, { status: 400 });

    // Ownership check: a shipment can only be initiated by the generator who
    // owns the waste lot (or an admin) — never by whoever happens to know
    // the waste lot's ID. This is a read-only pre-check; it does not modify
    // the existing, already-tested createShipment transaction below.
    if (authResult.user.role !== UserRole.ADMIN) {
      const wasteLot = await prisma.wasteLot.findUnique({ where: { id: parsed.data.wasteLotId }, select: { generatorId: true } });
      if (!wasteLot) return NextResponse.json({ error: "Waste lot not found" }, { status: 404 });
      if (wasteLot.generatorId !== authResult.user.id) {
        return NextResponse.json({ error: "You do not own this waste lot." }, { status: 403 });
      }
    }

    const result = await createShipment(parsed.data.wasteLotId, parsed.data.facilityId);
    if (!("code" in result)) return NextResponse.json(result, { status: 201 });
    if (result.code === "NOT_FOUND") return NextResponse.json({ error: result.message }, { status: 404 });
    if (["NETWORK_ERROR", "INVALID_RESPONSE"].includes(result.code)) return NextResponse.json({ error: result.message }, { status: 502 });
    return NextResponse.json({ error: result.message }, { status: 422 });
  } catch { return NextResponse.json({ error: "Internal Server Error" }, { status: 500 }); }
}
