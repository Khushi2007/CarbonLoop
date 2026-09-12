import { prisma } from "../db/prisma";
import { calculateRouteForCoordinates } from "../routing/routing";
import { SUPPORTED_CARBON_CONVERSION_PATHWAYS } from "./constants";
import { calculateCarbonBreakdown, getLandfillBaseline, getPathwayCarbonCoefficients } from "./engine";
import { CarbonCalculationResult, CarbonError } from "./types";

export async function calculateCarbonImpact(wasteLotId: string, facilityId: string): Promise<CarbonCalculationResult | CarbonError> {
  const [wasteLot, facility] = await Promise.all([
    prisma.wasteLot.findUnique({ where: { id: wasteLotId } }),
    prisma.facility.findUnique({ where: { id: facilityId } }),
  ]);

  if (!wasteLot) return { code: "NOT_FOUND", message: "Waste lot not found" };
  if (!facility) return { code: "NOT_FOUND", message: "Facility not found" };

  const quantityTonnes = Number(wasteLot.quantityTonnes);
  if (!Number.isFinite(quantityTonnes) || quantityTonnes <= 0) return { code: "INVALID_QUANTITY", message: "Waste lot quantity must be greater than zero." };
  if (!facility.acceptedWasteTypes.includes(wasteLot.wasteType)) return { code: "INCOMPATIBLE_FACILITY", message: "Facility does not accept this waste type." };
  if (!getLandfillBaseline(wasteLot.wasteType)) return { code: "UNSUPPORTED_WASTE_TYPE", message: `Unsupported waste type for carbon calculation: ${wasteLot.wasteType}` };
  if (!SUPPORTED_CARBON_CONVERSION_PATHWAYS.has(facility.facilityType)) return { code: "UNSUPPORTED_CONVERSION_PATHWAY", message: `Unsupported conversion pathway: ${facility.facilityType}` };
  if (!getPathwayCarbonCoefficients(wasteLot.wasteType, facility.facilityType)) return { code: "UNSUPPORTED_CARBON_COEFFICIENT", message: `Unsupported carbon coefficient combination: ${wasteLot.wasteType} / ${facility.facilityType}` };

  const route = await calculateRouteForCoordinates({
    origin: [Number(wasteLot.longitude), Number(wasteLot.latitude)],
    destination: [Number(facility.longitude), Number(facility.latitude)],
    quantityTonnes,
  });
  if ("code" in route) return route;

  try {
    const carbon = calculateCarbonBreakdown({
      wasteType: wasteLot.wasteType,
      conversionPathway: facility.facilityType,
      quantityTonnes,
      processingEfficiency: Number(facility.processingEfficiency),
      // Keep full OSRM precision for carbon calculations; API presentation may round separately.
      routeDistanceKm: route.distanceKm,
    });
    return {
      wasteLot: { id: wasteLot.id, wasteType: wasteLot.wasteType, quantityTonnes },
      facility: { id: facility.id, name: facility.name, facilityType: facility.facilityType },
      route: { distanceKm: route.distanceKm, durationMinutes: route.durationMinutes, estimatedTransportCostInr: route.estimatedTransportCostInr },
      carbon,
    };
  } catch (error) {
    return { code: "UNSUPPORTED_CARBON_COEFFICIENT", message: error instanceof Error ? error.message : "Unable to calculate carbon impact." };
  }
}
