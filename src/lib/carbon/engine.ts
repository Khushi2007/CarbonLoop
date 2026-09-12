import { FacilityType } from "@prisma/client";

import {
  LANDFILL_BASELINES_KG_CO2E_PER_TONNE,
  PATHWAY_CARBON_COEFFICIENTS,
  TRANSPORT_EMISSIONS_KG_CO2E_PER_TONNE_KM,
} from "./constants";
import { CarbonAssumptions, CarbonBreakdown, CarbonCalculationInput, PathwayCarbonCoefficients } from "./types";

export function getLandfillBaseline(wasteType: string) {
  return LANDFILL_BASELINES_KG_CO2E_PER_TONNE[wasteType];
}

export function getPathwayCarbonCoefficients(wasteType: string, conversionPathway: FacilityType): PathwayCarbonCoefficients | undefined {
  return PATHWAY_CARBON_COEFFICIENTS[wasteType]?.[conversionPathway];
}

export function calculateConversionOutputTonnes(quantityTonnes: number, processingEfficiency: number): number {
  return quantityTonnes * processingEfficiency / 100;
}

export function calculateAvoidedLandfillEmissionsKgCo2e(quantityTonnes: number, kgCo2ePerTonne: number): number {
  return quantityTonnes * kgCo2ePerTonne;
}

export function calculateCarbonStoredKgCo2e(quantityTonnes: number, kgCo2ePerTonne: number): number {
  return quantityTonnes * kgCo2ePerTonne;
}

export function calculateProcessEmissionsKgCo2e(quantityTonnes: number, kgCo2ePerTonne: number): number {
  return quantityTonnes * kgCo2ePerTonne;
}

/** quantity (tonnes) × actual road distance (km) × kg CO2e/(tonne-km). */
export function calculateTransportEmissionsKgCo2e(quantityTonnes: number, routeDistanceKm: number, kgCo2ePerTonneKm: number): number {
  return quantityTonnes * routeDistanceKm * kgCo2ePerTonneKm;
}

/** CarbonLoop equation: landfill avoided + carbon stored − process − transport. */
export function calculateNetCo2eBenefitKgCo2e(avoidedLandfill: number, carbonStored: number, processEmissions: number, transportEmissions: number): number {
  return avoidedLandfill + carbonStored - processEmissions - transportEmissions;
}

export function calculateCarbonBreakdown(input: CarbonCalculationInput): CarbonBreakdown {
  if (!Number.isFinite(input.quantityTonnes) || input.quantityTonnes <= 0) throw new RangeError("Waste quantity must be a positive finite number.");
  if (!Number.isFinite(input.processingEfficiency) || input.processingEfficiency < 0) throw new RangeError("Processing efficiency must be a non-negative finite percentage.");
  if (!Number.isFinite(input.routeDistanceKm) || input.routeDistanceKm < 0) throw new RangeError("Route distance must be a non-negative finite number.");

  const landfillBaseline = getLandfillBaseline(input.wasteType);
  if (!landfillBaseline) throw new RangeError(`Unsupported waste type for carbon calculation: ${input.wasteType}`);
  const pathwayCoefficients = getPathwayCarbonCoefficients(input.wasteType, input.conversionPathway);
  if (!pathwayCoefficients) throw new RangeError(`Unsupported carbon coefficient combination: ${input.wasteType} / ${input.conversionPathway}`);

  const avoidedLandfillEmissionsKgCo2e = calculateAvoidedLandfillEmissionsKgCo2e(input.quantityTonnes, landfillBaseline.value);
  const carbonStoredKgCo2e = calculateCarbonStoredKgCo2e(input.quantityTonnes, pathwayCoefficients.carbonStored.value);
  const processEmissionsKgCo2e = calculateProcessEmissionsKgCo2e(input.quantityTonnes, pathwayCoefficients.processEmissions.value);
  const transportEmissionsKgCo2e = calculateTransportEmissionsKgCo2e(input.quantityTonnes, input.routeDistanceKm, TRANSPORT_EMISSIONS_KG_CO2E_PER_TONNE_KM.value);

  const assumptions: CarbonAssumptions = { landfillBaseline, ...pathwayCoefficients, transportEmissions: TRANSPORT_EMISSIONS_KG_CO2E_PER_TONNE_KM };
  return {
    wasteQuantityTonnes: input.quantityTonnes,
    wasteType: input.wasteType,
    conversionPathway: input.conversionPathway,
    conversionOutputTonnes: calculateConversionOutputTonnes(input.quantityTonnes, input.processingEfficiency),
    routeDistanceKm: input.routeDistanceKm,
    avoidedLandfillEmissionsKgCo2e,
    carbonStoredKgCo2e,
    processEmissionsKgCo2e,
    transportEmissionsKgCo2e,
    netCo2eBenefitKgCo2e: calculateNetCo2eBenefitKgCo2e(avoidedLandfillEmissionsKgCo2e, carbonStoredKgCo2e, processEmissionsKgCo2e, transportEmissionsKgCo2e),
    assumptions,
  };
}
