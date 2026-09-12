import { prisma } from "../db/prisma";
import { estimateTransportCost } from "../matching/scoring";
import { getRouteFromOSRM } from "./osrm";
import { RouteAPIResponse, RoutingError } from "./types";

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

  // Call OSRM
  const routeResult = await getRouteFromOSRM(
    [wasteLon, wasteLat],
    [facilityLon, facilityLat]
  );

  if ("code" in routeResult) {
    // This means an error occurred
    return routeResult;
  }

  // Convert meters to km
  const distanceKm = routeResult.distance / 1000;
  
  // Convert seconds to minutes
  const durationMinutes = routeResult.duration / 60;

  // Calculate estimated transport cost using Stage 3's function
  const estimatedTransportCostInr = estimateTransportCost(
    distanceKm,
    Number(wasteLot.quantityTonnes)
  );

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
      distanceKm: Number(distanceKm.toFixed(3)),
      durationMinutes: Math.round(durationMinutes),
      estimatedTransportCostInr: Number(estimatedTransportCostInr.toFixed(2)),
      geometry: routeResult.geometry,
    },
  };
}
