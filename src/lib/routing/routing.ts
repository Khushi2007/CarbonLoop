import { prisma } from "../db/prisma";
import { estimateTransportCost } from "../matching/scoring";
import { getRouteFromOSRM } from "./osrm";
import { RouteAPIResponse, RoutingError } from "./types";

/**
 * Gets an OSRM route for already-loaded domain coordinates. This preserves the
 * Stage 4 routing calculation while allowing other domain services to reuse
 * the actual road distance without repeating database lookups.
 */
export async function calculateRouteForCoordinates({
  origin,
  destination,
  quantityTonnes,
}: {
  origin: [number, number];
  destination: [number, number];
  quantityTonnes: number;
}) {
  const routeResult = await getRouteFromOSRM(origin, destination);
  if ("code" in routeResult) return routeResult;

  const distanceKm = routeResult.distance / 1000;
  const durationMinutes = routeResult.duration / 60;
  const estimatedTransportCostInr = estimateTransportCost(distanceKm, quantityTonnes);

  return {
    distanceKm,
    durationMinutes,
    estimatedTransportCostInr,
    geometry: routeResult.geometry,
  };
}

export async function calculateRoute(
  wasteLotId: string,
  facilityId: string
): Promise<RouteAPIResponse | RoutingError> {
  // Load both entities
  const wasteLot = await prisma.wasteLot.findUnique({
    where: { id: wasteLotId },
  });

  if (!wasteLot) {
    return {
      code: "NOT_FOUND",
      message: "Waste lot not found",
    };
  }

  const facility = await prisma.facility.findUnique({
    where: { id: facilityId },
  });

  if (!facility) {
    return {
      code: "NOT_FOUND",
      message: "Facility not found",
    };
  }

  const wasteLat = Number(wasteLot.latitude);
  const wasteLon = Number(wasteLot.longitude);
  const facilityLat = Number(facility.latitude);
  const facilityLon = Number(facility.longitude);

  const routeResult = await calculateRouteForCoordinates({
    origin: [wasteLon, wasteLat],
    destination: [facilityLon, facilityLat],
    quantityTonnes: Number(wasteLot.quantityTonnes),
  });

  if ("code" in routeResult) {
    // This means an error occurred
    return routeResult;
  }

  return {
    wasteLot: {
      id: wasteLot.id,
      wasteType: wasteLot.wasteType,
      quantityTonnes: Number(wasteLot.quantityTonnes),
      latitude: wasteLat,
      longitude: wasteLon,
    },
    facility: {
      id: facility.id,
      name: facility.name,
      facilityType: facility.facilityType,
      latitude: facilityLat,
      longitude: facilityLon,
    },
    route: {
      distanceKm: Number(routeResult.distanceKm.toFixed(3)),
      durationMinutes: Math.round(routeResult.durationMinutes),
      estimatedTransportCostInr: Number(routeResult.estimatedTransportCostInr.toFixed(2)),
      geometry: routeResult.geometry,
    },
  };
}
