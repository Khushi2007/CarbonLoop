import { FacilityStatus, FacilityType } from "@prisma/client";

import { prisma } from "../db/prisma";

/** "ALL" removes the status filter entirely (e.g. for an admin/overview view). */
export type FacilityStatusFilter = FacilityStatus | "ALL";

export type FacilityListing = {
  id: string;
  name: string;
  facilityType: FacilityType;
  description: string | null;
  location: { latitude: number; longitude: number };
  capacityTonnesPerDay: number;
  availableCapacityTonnes: number;
  processingEfficiency: number;
  acceptedWasteTypes: string[];
  status: FacilityStatus;
};

/**
 * Lists facilities for dashboard consumption. Defaults to ACTIVE facilities
 * unless an explicit status (or "ALL") is requested.
 */
export async function listFacilities(filter?: { status?: FacilityStatusFilter }): Promise<FacilityListing[]> {
  const status = filter?.status;
  const where = status === undefined ? { status: FacilityStatus.ACTIVE } : status === "ALL" ? {} : { status };

  const facilities = await prisma.facility.findMany({ where, orderBy: { name: "asc" } });

  return facilities.map((facility) => ({
    id: facility.id,
    name: facility.name,
    facilityType: facility.facilityType,
    description: facility.description,
    location: { latitude: Number(facility.latitude), longitude: Number(facility.longitude) },
    capacityTonnesPerDay: Number(facility.capacityTonnesPerDay),
    availableCapacityTonnes: Number(facility.availableCapacityTonnes),
    processingEfficiency: Number(facility.processingEfficiency),
    acceptedWasteTypes: facility.acceptedWasteTypes,
    status: facility.status,
  }));
}
