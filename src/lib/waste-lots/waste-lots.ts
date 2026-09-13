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
  createdAt: Date;
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
    createdAt: lot.createdAt,
    generator: { id: lot.generator.id, name: lot.generator.name, organization: lot.generator.organization },
  }));
}

export type CreateWasteLotInput = {
  /**
   * The owning generator's `users.id`. Callers (API routes) must derive this
   * server-side from the authenticated session — never from client-supplied
   * request data — so a waste lot can never be created on another
   * generator's behalf.
   */
  generatorId: string;
  wasteType: string;
  quantityTonnes: number;
  moisturePercent?: number;
  qualityScore?: number;
  latitude: number;
  longitude: number;
  availableFrom: Date;
};

export async function createWasteLot(input: CreateWasteLotInput): Promise<WasteLotListing> {
  const lot = await prisma.wasteLot.create({
    data: {
      generatorId: input.generatorId,
      wasteType: input.wasteType,
      quantityTonnes: input.quantityTonnes,
      moisturePercent: input.moisturePercent,
      qualityScore: input.qualityScore,
      latitude: input.latitude,
      longitude: input.longitude,
      availableFrom: input.availableFrom,
    },
    include: { generator: true },
  });

  return {
    id: lot.id,
    wasteType: lot.wasteType,
    quantityTonnes: Number(lot.quantityTonnes),
    moisturePercent: lot.moisturePercent === null ? null : Number(lot.moisturePercent),
    qualityScore: lot.qualityScore === null ? null : Number(lot.qualityScore),
    location: { latitude: Number(lot.latitude), longitude: Number(lot.longitude) },
    availableFrom: lot.availableFrom,
    status: lot.status,
    createdAt: lot.createdAt,
    generator: { id: lot.generator.id, name: lot.generator.name, organization: lot.generator.organization },
  };
}
