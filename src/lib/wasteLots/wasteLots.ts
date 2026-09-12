import { prisma } from "../db/prisma";
import { WasteLotListItem } from "./types";

export async function listWasteLots(): Promise<WasteLotListItem[]> {
  const wasteLots = await prisma.wasteLot.findMany({ orderBy: { availableFrom: "desc" } });
  return wasteLots.map((lot) => ({
    id: lot.id,
    wasteType: lot.wasteType,
    quantityTonnes: Number(lot.quantityTonnes),
    status: lot.status,
    latitude: Number(lot.latitude),
    longitude: Number(lot.longitude),
    availableFrom: lot.availableFrom,
    createdAt: lot.createdAt,
  }));
}
