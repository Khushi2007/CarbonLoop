import { WasteLotStatus } from "@prisma/client";

import { prisma } from "../db/prisma";

/** "ALL" removes the status filter entirely (e.g. for a full history view). */
export type WasteLotStatusFilter = WasteLotStatus | "ALL";

export type WasteLotListing = {
  id: string;
  wasteType: string;
  quantityTonnes: number;
  moisturePercent: number | null;
  qualityScore: number | null;
  location: { latitude: number; longitude: number };
  availableFrom: Date;
  status: WasteLotStatus;
  generator: { id: string; name: string; organization: string | null };
};

/**
 * Lists waste lots for dashboard consumption. Defaults to AVAILABLE lots —
 * the set relevant to starting a new matching/shipment workflow — unless an
 * explicit status (or "ALL") is requested.
 */
export async function listWasteLots(filter?: { status?: WasteLotStatusFilter }): Promise<WasteLotListing[]> {
  const status = filter?.status;
  const where = status === undefined ? { status: WasteLotStatus.AVAILABLE } : status === "ALL" ? {} : { status };

  const wasteLots = await prisma.wasteLot.findMany({
    where,
    include: { generator: true },
    orderBy: { availableFrom: "asc" },
  });

  return wasteLots.map((lot) => ({
    id: lot.id,
    wasteType: lot.wasteType,
    quantityTonnes: Number(lot.quantityTonnes),
    moisturePercent: lot.moisturePercent === null ? null : Number(lot.moisturePercent),
    qualityScore: lot.qualityScore === null ? null : Number(lot.qualityScore),
    location: { latitude: Number(lot.latitude), longitude: Number(lot.longitude) },
    availableFrom: lot.availableFrom,
    status: lot.status,
    generator: { id: lot.generator.id, name: lot.generator.name, organization: lot.generator.organization },
  }));
}
