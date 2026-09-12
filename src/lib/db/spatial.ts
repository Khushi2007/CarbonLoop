import { Prisma } from "@prisma/client";

import { prisma } from "./prisma";

export type NearbyFacility = {
  id: string;
  name: string;
  facilityType: string;
  latitude: Prisma.Decimal;
  longitude: Prisma.Decimal;
  availableCapacityTonnes: Prisma.Decimal;
  distanceKm: number;
};

type NearbyFacilityQuery = Omit<NearbyFacility, "distanceKm"> & {
  distanceKm: number | Prisma.Decimal;
};

/**
 * Finds active facilities inside a radius using PostGIS geography calculations.
 * Coordinates are WGS84 longitude/latitude points (SRID 4326); the radius is metres.
 */
export async function findFacilitiesWithinKilometers({
  latitude,
  longitude,
  radiusKilometers,
}: {
  latitude: number;
  longitude: number;
  radiusKilometers: number;
}): Promise<NearbyFacility[]> {
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    throw new RangeError("Coordinates must be valid WGS84 latitude and longitude values.");
  }

  if (radiusKilometers <= 0) {
    throw new RangeError("radiusKilometers must be greater than zero.");
  }

  const radiusMetres = radiusKilometers * 1_000;
  const facilities = await prisma.$queryRaw<NearbyFacilityQuery[]>(Prisma.sql`
    SELECT
      f.id,
      f.name,
      f.facility_type::text AS "facilityType",
      f.latitude,
      f.longitude,
      f.available_capacity_tonnes AS "availableCapacityTonnes",
      ST_Distance(
        ST_SetSRID(ST_MakePoint(f.longitude, f.latitude), 4326)::geography,
        ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography
      ) / 1000.0 AS "distanceKm"
    FROM facilities AS f
    WHERE f.status = 'ACTIVE'
      AND ST_DWithin(
        ST_SetSRID(ST_MakePoint(f.longitude, f.latitude), 4326)::geography,
        ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
        ${radiusMetres}
      )
    ORDER BY "distanceKm" ASC
  `);

  return facilities.map((facility) => ({
    ...facility,
    distanceKm: Number(facility.distanceKm),
  }));
}
