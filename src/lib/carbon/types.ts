import { FacilityType } from "@prisma/client";

export type CarbonCoefficient = {
  /** Stable identifier for displaying and later replacing this assumption. */
  id: string;
  /** Numeric coefficient expressed in the documented unit. */
  value: number;
  unit: "kg CO2e per tonne input" | "kg CO2e per tonne-km";
  /** Every coefficient currently in this module is an illustrative MVP assumption. */
  assumption: "illustrative-demo-mvp";
  description: string;
};

export type PathwayCarbonCoefficients = {
  carbonStored: CarbonCoefficient;
  processEmissions: CarbonCoefficient;
};

export type CarbonCalculationInput = {
  wasteType: string;
  conversionPathway: FacilityType;
  quantityTonnes: number;
  processingEfficiency: number;
  routeDistanceKm: number;
};

export type CarbonAssumptions = {
  landfillBaseline: CarbonCoefficient;
  carbonStored: CarbonCoefficient;
  processEmissions: CarbonCoefficient;
  transportEmissions: CarbonCoefficient;
};

export type CarbonBreakdown = {
  wasteQuantityTonnes: number;
  wasteType: string;
  conversionPathway: FacilityType;
  conversionOutputTonnes: number;
  routeDistanceKm: number;
  avoidedLandfillEmissionsKgCo2e: number;
  carbonStoredKgCo2e: number;
  processEmissionsKgCo2e: number;
  transportEmissionsKgCo2e: number;
  netCo2eBenefitKgCo2e: number;
  assumptions: CarbonAssumptions;
};

export type CarbonError = {
  code:
    | "NOT_FOUND"
    | "INCOMPATIBLE_FACILITY"
    | "INVALID_QUANTITY"
    | "UNSUPPORTED_WASTE_TYPE"
    | "UNSUPPORTED_CONVERSION_PATHWAY"
    | "UNSUPPORTED_CARBON_COEFFICIENT"
    | "NO_ROUTE"
    | "NETWORK_ERROR"
    | "INVALID_RESPONSE"
    | "INVALID_COORDINATES";
  message: string;
};

export type CarbonCalculationResult = {
  wasteLot: {
    id: string;
    wasteType: string;
    quantityTonnes: number;
  };
  facility: {
    id: string;
    name: string;
    facilityType: FacilityType;
  };
  route: {
    distanceKm: number;
    durationMinutes: number;
    estimatedTransportCostInr: number;
  };
  carbon: CarbonBreakdown;
};
