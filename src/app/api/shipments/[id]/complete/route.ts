import { UserRole } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireCarbonLoopUser } from "../../../../../lib/auth/session";
import { prisma } from "../../../../../lib/db/prisma";
import { completeShipment } from "../../../../../lib/shipments/shipments";

const schema = z.object({ id: z.string().uuid() });
export async function POST(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const authResult = await requireCarbonLoopUser([UserRole.GENERATOR, UserRole.ADMIN]);
  if (!authResult.ok) return NextResponse.json({ error: authResult.message }, { status: authResult.status });

  const parsed = schema.safeParse(await context.params);
  if (!parsed.success) return NextResponse.json({ error: "Invalid shipment ID", details: parsed.error.issues }, { status: 400 });

  // Ownership check: only the generator who owns the shipment's waste lot
  // (or an admin) may complete it. Read-only pre-check — the existing,
  // already-tested completeShipment transaction below is unchanged.
  if (authResult.user.role !== UserRole.ADMIN) {
    const shipment = await prisma.shipment.findUnique({
      where: { id: parsed.data.id },
      select: { wasteLot: { select: { generatorId: true } } },
    });
    if (!shipment) return NextResponse.json({ error: "Shipment not found" }, { status: 404 });
    if (shipment.wasteLot.generatorId !== authResult.user.id) {
      return NextResponse.json({ error: "You do not own this shipment." }, { status: 403 });
    }
  }

  const result = await completeShipment(parsed.data.id);
  if (!("code" in result)) return NextResponse.json(result, { status: 200 });
  if (result.code === "NOT_FOUND") return NextResponse.json({ error: result.message }, { status: 404 });
  // Unexpected infrastructure failures are surfaced generically — never the underlying
  // error message — so internal details are never exposed to the caller.
  if (result.code === "INTERNAL_ERROR") return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  return NextResponse.json({ error: result.message }, { status: 422 });
}
