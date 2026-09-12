import { FacilityType } from "@prisma/client";

import { AVOIDED_LANDFILL_VALUE_INR_PER_TONNE, CARBON_RELATED_VALUE_INR_PER_TONNE_CO2E_BENEFIT, CONVERSION_OUTPUT_VALUE_INR_PER_TONNE } from "./constants";
import { EconomicBreakdown, EconomicCalculationInput } from "./types";

export const getAvoidedLandfillValueCoefficient = (wasteType: string) => AVOIDED_LANDFILL_VALUE_INR_PER_TONNE[wasteType];
export const getConversionOutputValueCoefficient = (pathway: FacilityType) => CONVERSION_OUTPUT_VALUE_INR_PER_TONNE[pathway];
export function getEconomicAssumptions(wasteType: string, pathway: FacilityType) {
  const avoidedLandfill = getAvoidedLandfillValueCoefficient(wasteType);
  const conversionOutput = getConversionOutputValueCoefficient(pathway);
  if (!avoidedLandfill || !conversionOutput) return undefined;
  return { avoidedLandfill, conversionOutput, carbonRelated: CARBON_RELATED_VALUE_INR_PER_TONNE_CO2E_BENEFIT };
}
export const calculateAvoidedLandfillValueInr = (tonnes: number, inrPerTonne: number) => tonnes * inrPerTonne;
export const calculateConversionOutputValueInr = (tonnes: number, inrPerTonne: number) => tonnes * inrPerTonne;
export const calculateCarbonRelatedValueInr = (benefitKg: number, inrPerTonneCo2e: number) => benefitKg / 1000 * inrPerTonneCo2e;
export const calculateEstimatedEconomicValueInr = (transportCost: number, avoidedLandfill: number, outputValue: number, carbonValue: number) => -transportCost + avoidedLandfill + outputValue + carbonValue;

export function calculateEconomicBreakdown(input: EconomicCalculationInput): EconomicBreakdown {
  if (![input.wasteQuantityTonnes, input.conversionOutputTonnes, input.transportCostInr, input.netCo2eBenefitKgCo2e].every(Number.isFinite)) throw new RangeError("Economic inputs must be finite.");
  if (input.wasteQuantityTonnes < 0 || input.conversionOutputTonnes < 0 || input.transportCostInr < 0) throw new RangeError("Economic quantities and transport cost must be non-negative.");
  const avoidedLandfill = getAvoidedLandfillValueCoefficient(input.wasteType);
  if (!avoidedLandfill) throw new RangeError(`Unsupported waste type for economics: ${input.wasteType}`);
  const conversionOutput = getConversionOutputValueCoefficient(input.conversionPathway);
  if (!conversionOutput) throw new RangeError(`Unsupported conversion pathway for economics: ${input.conversionPathway}`);
  const assumptions = { avoidedLandfill, conversionOutput, carbonRelated: CARBON_RELATED_VALUE_INR_PER_TONNE_CO2E_BENEFIT };
  const avoidedLandfillValueInr = calculateAvoidedLandfillValueInr(input.wasteQuantityTonnes, avoidedLandfill.value);
  const conversionOutputValueInr = calculateConversionOutputValueInr(input.conversionOutputTonnes, conversionOutput.value);
  const carbonRelatedValueInr = calculateCarbonRelatedValueInr(input.netCo2eBenefitKgCo2e, CARBON_RELATED_VALUE_INR_PER_TONNE_CO2E_BENEFIT.value);
  return { wasteQuantityTonnes: input.wasteQuantityTonnes, conversionOutputTonnes: input.conversionOutputTonnes, transportCostInr: input.transportCostInr, avoidedLandfillValueInr, conversionOutputValueInr, carbonRelatedValueInr, estimatedEconomicValueInr: calculateEstimatedEconomicValueInr(input.transportCostInr, avoidedLandfillValueInr, conversionOutputValueInr, carbonRelatedValueInr), assumptions };
}
