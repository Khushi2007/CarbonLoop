import { FacilityType } from "@prisma/client";

export type EconomicCoefficient = {
  id: string;
  value: number;
  unit: "INR per tonne input" | "INR per tonne output" | "INR per tonne CO2e benefit";
  assumption: "illustrative-demo-mvp";
  description: string;
};

export type EconomicCalculationInput = {
  wasteType: string;
  conversionPathway: FacilityType;
  wasteQuantityTonnes: number;
  conversionOutputTonnes: number;
  transportCostInr: number;
  netCo2eBenefitKgCo2e: number;
};

export type EconomicBreakdown = {
  wasteQuantityTonnes: number;
  conversionOutputTonnes: number;
  transportCostInr: number;
  avoidedLandfillValueInr: number;
  conversionOutputValueInr: number;
  carbonRelatedValueInr: number;
  estimatedEconomicValueInr: number;
  assumptions: {
    avoidedLandfill: EconomicCoefficient;
    conversionOutput: EconomicCoefficient;
    carbonRelated: EconomicCoefficient;
  };
};
